import { createApp } from '../src/app.js';
import { RpgStore, rpgStore } from '../src/database/rpgStore.js';

const app = createApp();

let server: any;
let baseUrl: string;

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`❌ Assertion Failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function request(endpoint: string, options: RequestInit = {}, token?: string) {
  const url = `${baseUrl}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('       LIFE RPG BACKEND SYSTEM VERIFICATION SUITE     ');
  console.log('======================================================\n');

  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}/api`;
      console.log(`🧪 Test Server active on ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check Endpoint
    // ----------------------------------------------------
    console.log('▶ [1/13] Verifying Health Check Endpoint...');
    const health = await request('/health');
    assert(health.status === 200, 'Health check returns HTTP 200');
    assert(health.body.success === true, 'Health check reports success: true');
    assert(health.body.message.includes('LIFE RPG'), 'Health check identifies as LIFE RPG backend');

    // ----------------------------------------------------
    // TEST 2: User Registration & Strict Level 0 Baseline
    // ----------------------------------------------------
    console.log('\n▶ [2/13] Verifying Registration & Strict Level 0 Baseline...');
    const userAEmail = `hero_a_${Date.now()}@liferpg.dev`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Adventurer Alice',
        email: userAEmail,
        password: 'securePassword123'
      })
    });
    assert(regRes.status === 201, 'Registration returns HTTP 201 Created');
    assert(regRes.body.success === true, 'Registration payload indicates success');
    assert(!!regRes.body.data.token, 'Registration returns valid JWT bearer token');
    const tokenA = regRes.body.data.token;
    const userAId = regRes.body.data.user.userId;

    // Verify baseline Level 0 state
    const charInitial = await request('/character', {}, tokenA);
    assert(charInitial.status === 200, 'Character sheet retrieved');
    assert(charInitial.body.data.level === 0, 'New user starts at Level 0 baseline');
    assert(charInitial.body.data.gold === 100, 'New user starts with 100 starter Gold');
    assert(charInitial.body.data.currentXp === 0, 'New user starts with 0 current XP');
    assert(charInitial.body.data.totalXp === 0, 'New user starts with 0 total XP');
    assert(charInitial.body.data.streak === 0, 'New user starts with 0 streak');
    assert(charInitial.body.data.bestStreak === 0, 'New user starts with 0 best streak');
    assert(charInitial.body.data.attributePoints === 0, 'New user starts with 0 attribute points');

    // Verify empty initial quest log & inventory
    const questsInitial = await request('/quests', {}, tokenA);
    assert(questsInitial.body.data.length === 0, 'New user starts with 0 quests');

    const invInitial = await request('/inventory', {}, tokenA);
    assert(invInitial.body.data.length === 0, 'New user starts with empty inventory');

    const achInitial = await request('/achievements', {}, tokenA);
    assert(achInitial.body.data.every((a: any) => !a.unlocked), 'New user starts with 0 unlocked achievements');

    // Duplicate Registration check
    const dupRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Adventurer Alice Duplicate',
        email: userAEmail,
        password: 'securePassword123'
      })
    });
    assert(dupRes.status === 409, 'Duplicate email registration rejected with HTTP 409');
    assert(dupRes.body.error.code === 'EMAIL_EXISTS', 'Duplicate registration returns EMAIL_EXISTS');

    // ----------------------------------------------------
    // TEST 3: Google OAuth Endpoint & User Account Mechanics
    // ----------------------------------------------------
    console.log('\n▶ [3/13] Verifying Google OAuth Integration & Lifecycle...');
    const googleUserEmail = `google_hero_${Date.now()}@gmail.com`;
    const googleAuthRes = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email: googleUserEmail,
        name: 'Google Vanguard',
        googleId: `gid_${Date.now()}`,
        avatar: 'avatar-03'
      })
    });
    assert(googleAuthRes.status === 200, 'POST /auth/google returns HTTP 200');
    assert(!!googleAuthRes.body.data.token, 'Google auth provides valid JWT token');
    assert(googleAuthRes.body.data.user.email === googleUserEmail, 'Google user email matches');
    const googleUserId = googleAuthRes.body.data.user.id;

    // Verify Google user gets strict Level 0 baseline (0 XP, 100 gold, 0 streak, 0 completed quests)
    const googleChar = await request('/character', {}, googleAuthRes.body.data.token);
    assert(googleChar.body.data.level === 0, 'Google authenticated user initializes at Level 0');
    assert(googleChar.body.data.currentXp === 0, 'Google user initializes at 0 Current XP');
    assert(googleChar.body.data.totalXp === 0, 'Google user initializes at 0 Total XP');
    assert(googleChar.body.data.gold === 100, 'Google authenticated user initializes with 100 Gold');
    assert(googleChar.body.data.streak === 0, 'Google authenticated user initializes with 0 Streak');
    assert(googleChar.body.data.completedQuestsCount === 0, 'Google user has 0 completed quests');

    // Verify returning Google user reuses existing account without creating duplicates
    const returningGoogleRes = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email: googleUserEmail,
        name: 'Google Vanguard Updated Name',
      })
    });
    assert(returningGoogleRes.status === 200, 'Returning Google user succeeds with HTTP 200');
    assert(returningGoogleRes.body.data.user.id === googleUserId, 'Returning Google user reuses existing LIFE RPG account ID (no duplicate)');

    // Verify linking Google ID to existing email account (prevents duplicate accounts)
    const existingLocalEmail = `adventurer_${Date.now()}@liferpg.dev`;
    const localReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Local Account Adventurer',
        email: existingLocalEmail,
        password: 'Password123!'
      })
    });
    assert(localReg.status === 201, 'Local account registered');
    const localUserId = localReg.body.data.user.id;

    // Now sign in with Google using that same email
    const linkGoogleRes = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({
        email: existingLocalEmail,
        googleId: `gid_linked_${Date.now()}`
      })
    });
    assert(linkGoogleRes.status === 200, 'Linking Google to existing email account returns HTTP 200');
    assert(linkGoogleRes.body.data.user.id === localUserId, 'Existing account preserved without creating duplicate');

    // ----------------------------------------------------
    // TEST 4: Profile Updates & Avatar Security Validation
    // ----------------------------------------------------
    console.log('\n▶ [4/13] Verifying Profile Updates & Avatar Security Validation...');
    // Valid avatar update (avatar-01 to avatar-24)
    const validProfile = await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        avatar: 'avatar-12',
        bio: 'Disciplined Paladin of Productivity',
        timezone: 'America/New_York'
      })
    }, tokenA);
    assert(validProfile.status === 200, 'Updating profile with valid avatar-12 succeeds');
    assert(validProfile.body.data.avatar === 'avatar-12', 'Avatar updated to avatar-12');
    assert(validProfile.body.data.bio === 'Disciplined Paladin of Productivity', 'Bio updated');

    // Invalid avatar update (arbitrary external URL / injection)
    const invalidAvatar = await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        avatar: 'https://malicious-site.com/image.png'
      })
    }, tokenA);
    assert(invalidAvatar.status === 400, 'Arbitrary external avatar URL rejected with HTTP 400');

    // Client-side stat hacking protection (attempting to set level or gold via profile)
    const statHackRes = await request('/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        level: 99,
        gold: 999999
      })
    }, tokenA);
    // Profile service whitelists only safe fields (fullName, avatar, bio, classType, timezone, preferences, onboardingCompleted)
    const verifySheet = await request('/character', {}, tokenA);
    assert(verifySheet.body.data.level === 0, 'Client-side level tampering was ignored by backend');
    assert(verifySheet.body.data.gold === 100, 'Client-side gold tampering was ignored by backend');

    // ----------------------------------------------------
    // TEST 5: Strict User Data Isolation (User A vs User B)
    // ----------------------------------------------------
    console.log('\n▶ [5/13] Verifying Strict User Data Isolation...');
    const userBEmail = `hero_b_${Date.now()}@liferpg.dev`;
    const regB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Adventurer Bob',
        email: userBEmail,
        password: 'password123'
      })
    });
    const tokenB = regB.body.data.token;

    // User A creates a Quest
    const questCreate = await request('/quests', {
      method: 'POST',
      body: JSON.stringify({
        title: "Alice's Secret Strategy",
        category: 'study',
        difficulty: 'medium'
      })
    }, tokenA);
    assert(questCreate.status === 201, "User A creates private quest");
    const questAId = questCreate.body.data.id;

    // User B attempts to read User A's quest
    const unauthorizedGet = await request(`/quests/${questAId}`, {}, tokenB);
    assert(unauthorizedGet.status === 404, "User B cannot retrieve User A's quest (HTTP 404)");

    // User B attempts to complete User A's quest
    const unauthorizedComplete = await request(`/quests/${questAId}/complete`, { method: 'POST' }, tokenB);
    assert(unauthorizedComplete.status === 404, "User B cannot complete User A's quest (HTTP 404)");

    // User B attempts to delete User A's quest
    const unauthorizedDelete = await request(`/quests/${questAId}`, { method: 'DELETE' }, tokenB);
    assert(unauthorizedDelete.status === 404, "User B cannot delete User A's quest (HTTP 404)");

    // ----------------------------------------------------
    // TEST 6: Quest Validation & Completion Progression
    // ----------------------------------------------------
    console.log('\n▶ [6/13] Verifying Authoritative Quest Completion & Rewards...');
    // Empty title validation
    const emptyTitleRes = await request('/quests', {
      method: 'POST',
      body: JSON.stringify({ title: '' })
    }, tokenA);
    assert(emptyTitleRes.status === 400, 'Empty quest title rejected with HTTP 400');

    // Complete Epic coding quest for Alice
    const epicQuestRes = await request('/quests', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Master Distributed Systems & Consensus',
        category: 'coding',
        difficulty: 'epic'
      })
    }, tokenA);
    const epicQuestId = epicQuestRes.body.data.id;

    const completeRes = await request(`/quests/${epicQuestId}/complete`, { method: 'POST' }, tokenA);
    assert(completeRes.status === 200, 'Quest completion returns HTTP 200');
    assert(completeRes.body.data.xpEarned === 250, 'Authoritative Epic XP awarded (+250 XP)');
    assert(completeRes.body.data.goldEarned === 120, 'Authoritative Epic Gold awarded (+120 Gold)');
    assert(completeRes.body.data.streak === 1, 'First quest completed sets consecutive streak to 1');

    // Anti-farming idempotency check
    const dupComplete = await request(`/quests/${epicQuestId}/complete`, { method: 'POST' }, tokenA);
    assert(dupComplete.status === 409, 'Duplicate quest completion rejected with HTTP 409 ALREADY_COMPLETED');

    // ----------------------------------------------------
    // TEST 7: Streak Mechanics (Single Active Day Enforcement)
    // ----------------------------------------------------
    console.log('\n▶ [7/13] Verifying Streak Mechanics & Single Active Day Enforcement...');
    // Complete a SECOND quest on the SAME day for User A
    const quest2Res = await request('/quests', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Morning 5K Run',
        category: 'fitness',
        difficulty: 'medium'
      })
    }, tokenA);
    const quest2Id = quest2Res.body.data.id;

    const complete2Res = await request(`/quests/${quest2Id}/complete`, { method: 'POST' }, tokenA);
    assert(complete2Res.status === 200, 'Second quest on same day completes successfully');
    assert(complete2Res.body.data.streak === 1, 'Streak REMAINS 1 (multiple quests on same day = 1 active day)');

    const streakState = await request('/streaks', {}, tokenA);
    assert(streakState.status === 200, 'GET /streaks returns streak status');
    assert(streakState.body.data.currentStreak === 1, 'Current streak is exactly 1 day');
    assert(streakState.body.data.bestStreak === 1, 'Best streak is exactly 1 day');

    // ----------------------------------------------------
    // TEST 8: Monthly Activity Matrix & Progress Telemetry
    // ----------------------------------------------------
    console.log('\n▶ [8/13] Verifying Monthly Activity Matrix & Telemetry...');
    const monthlyRes = await request('/streaks/monthly', {}, tokenA);
    assert(monthlyRes.status === 200, 'GET /streaks/monthly returns HTTP 200');
    assert(Array.isArray(monthlyRes.body.data.days), 'Monthly activity contains days array');
    assert(monthlyRes.body.data.activeDays === 1, 'Active days count is exactly 1');
    assert(typeof monthlyRes.body.data.consistencyRate === 'number', 'Consistency rate is numeric');

    const todayDay = monthlyRes.body.data.days.find((d: any) => d.isToday);
    assert(!!todayDay, "Today's date is flagged in monthly activity");
    assert(todayDay.completed === true, "Today's day is marked completed");
    assert(todayDay.questsCompleted === 2, "Today has exactly 2 quests completed logged");

    // Strict check: ALL other days (e.g. Day 11, Day 12) must be INACTIVE with 0 quests
    const otherDays = monthlyRes.body.data.days.filter((d: any) => !d.isToday);
    const nonTodayActive = otherDays.some((d: any) => d.active || d.completed || d.questsCompleted > 0);
    assert(!nonTodayActive, 'Zero fabricated history: all days other than today are strictly INACTIVE with 0 completions');

    // Complete a THIRD quest today for User A to verify 1 -> 2 -> 3 count progression without streak bloating
    const quest3Res = await request('/quests', {
      method: 'POST',
      body: JSON.stringify({
        title: '30-Minute Focused Reading',
        category: 'reading',
        difficulty: 'easy'
      })
    }, tokenA);
    const quest3Id = quest3Res.body.data.id;
    const complete3Res = await request(`/quests/${quest3Id}/complete`, { method: 'POST' }, tokenA);
    assert(complete3Res.status === 200, 'Third quest on same day completes successfully');
    assert(complete3Res.body.data.streak === 1, 'Streak STILL remains 1 after 3rd quest (same calendar date)');
    assert(complete3Res.body.data.todayQuestCount === 3, 'Today quest count authoritatively advances to 3');

    // Re-verify monthly matrix reflects 3 quests today, activeDays still 1
    const monthlyResAfter3 = await request('/streaks/monthly', {}, tokenA);
    const todayAfter3 = monthlyResAfter3.body.data.days.find((d: any) => d.isToday);
    assert(todayAfter3.questsCompleted === 3, 'Today now reflects 3 completed quests');
    assert(monthlyResAfter3.body.data.activeDays === 1, 'Active days count is still exactly 1');

    // User isolation: Verify User B has 0 active days and all days inactive
    const monthlyResB = await request('/streaks/monthly', {}, tokenB);
    assert(monthlyResB.body.data.activeDays === 0, 'User B has 0 active days');
    assert(monthlyResB.body.data.days.every((d: any) => !d.active && !d.completed && d.questsCompleted === 0), 'User B has all days inactive');

    // Progress Telemetry
    const progRes = await request('/progress', {}, tokenA);
    assert(progRes.status === 200, 'GET /progress returns HTTP 200');
    assert(progRes.body.data.weeklyXP >= 320, 'Weekly XP reflects completed quests');
    assert(progRes.body.data.activeDays === 1, 'Telemetry active days equals 1');
    assert(progRes.body.data.currentStreak === 1, 'Telemetry streak equals 1');

    // ----------------------------------------------------
    // TEST 9: Non-Linear Progression & Leveling Up
    // ----------------------------------------------------
    console.log('\n▶ [9/13] Verifying Non-Linear Level Progression & Attribute Points...');
    const charAfter = await request('/character', {}, tokenA);
    // User earned 250 + 80 = 330 XP.
    // L1 requires 100 XP (accum = 100).
    // L2 requires 135 XP (accum = 235).
    // L3 requires 182 XP (accum = 417).
    // 330 XP puts user into Level 3 with 95 XP towards Level 4.
    assert(charAfter.body.data.level === 3, `User correctly calculated at Level ${charAfter.body.data.level} (expected 3)`);
    assert(charAfter.body.data.attributePoints >= 3, 'Leveling up awarded attribute points');

    // Allocate attribute points
    const allocRes = await request('/character/attributes/allocate', {
      method: 'POST',
      body: JSON.stringify({ attribute: 'intellect', points: 2 })
    }, tokenA);
    assert(allocRes.status === 200, 'Allocating attribute points succeeds');
    assert(allocRes.body.data.attributePoints === charAfter.body.data.attributePoints - 2, 'Attribute points deducted');

    // ----------------------------------------------------
    // TEST 10: Virtual Economy & Inventory
    // ----------------------------------------------------
    console.log('\n▶ [10/13] Verifying Virtual Economy & Inventory Management...');
    const bazaar = await request('/rewards', {}, tokenA);
    assert(bazaar.status === 200, 'GET /rewards returns reward list');
    assert(bazaar.body.data.length > 0, 'Bazaar catalog populated');

    // User A earned 100 initial + 120 (epic) + 35 (medium) = 255 Gold
    const targetReward = bazaar.body.data.find((r: any) => r.price <= 255 && (!r.requiredLevel || r.requiredLevel <= 3)) || bazaar.body.data[0];

    const buyRes = await request(`/rewards/${targetReward.id}/purchase`, { method: 'POST' }, tokenA);
    assert(buyRes.status === 200, 'Reward purchased successfully');
    assert(buyRes.body.data.reward.owned === true, 'Reward marked as owned');

    // Duplicate purchase prevented
    const dupBuy = await request(`/rewards/${targetReward.id}/purchase`, { method: 'POST' }, tokenA);
    assert(dupBuy.status === 409, 'Duplicate item purchase prevented with HTTP 409');

    // Equip / Unequip
    const equipRes = await request(`/inventory/${targetReward.id}/equip`, { method: 'POST' }, tokenA);
    assert(equipRes.status === 200, 'Item equipped');
    assert(equipRes.body.data.equipped === true, 'Equip status true');

    const unequipRes = await request(`/inventory/${targetReward.id}/unequip`, { method: 'POST' }, tokenA);
    assert(unequipRes.status === 200, 'Item unequipped');
    assert(unequipRes.body.data.equipped === false, 'Equip status false');

    // ----------------------------------------------------
    // TEST 11: Achievements & Claims
    // ----------------------------------------------------
    console.log('\n▶ [11/13] Verifying Milestone Unlocks & Claim Flow...');
    const achs = await request('/achievements', {}, tokenA);
    assert(achs.status === 200, 'GET /achievements returns milestones');
    const firstQuestAch = achs.body.data.find((a: any) => a.id === 'ach-1');
    assert(firstQuestAch.unlocked === true, 'First Quest achievement unlocked');

    const claimRes = await request('/achievements/ach-1/claim', { method: 'POST' }, tokenA);
    assert(claimRes.status === 200, 'Achievement reward claimed successfully');
    assert(claimRes.body.data.claimed === true, 'Achievement marked claimed');

    // Duplicate claim rejected
    const dupClaim = await request('/achievements/ach-1/claim', { method: 'POST' }, tokenA);
    assert(dupClaim.status === 409, 'Duplicate claim rejected with HTTP 409 ALREADY_CLAIMED');

    // ----------------------------------------------------
    // TEST 12: Google Calendar 3-State Integration & Security
    // ----------------------------------------------------
    console.log('\n▶ [12/13] Verifying Google Calendar 3-State Lifecycle & Security...');
    // Initial status: disconnected
    const calStatus1 = await request('/calendar/status', {}, tokenA);
    assert(calStatus1.status === 200, 'GET /calendar/status returns HTTP 200');
    assert(calStatus1.body.data.connected === false, 'Calendar initially disconnected');
    assert(calStatus1.body.data.status === 'NOT_CONNECTED', 'Status is NOT_CONNECTED');

    // When disconnected, requesting events returns empty array (no leaks)
    const disconnectedEvents = await request('/calendar/events', {}, tokenA);
    assert(disconnectedEvents.status === 200, 'GET /calendar/events while disconnected returns HTTP 200');
    assert(Array.isArray(disconnectedEvents.body.data) && disconnectedEvents.body.data.length === 0, 'No calendar events returned when disconnected');

    // Connect calendar
    const calConnect = await request('/calendar/connect', {
      method: 'POST',
      body: JSON.stringify({ email: 'alice.adventurer@gmail.com' })
    }, tokenA);
    assert(calConnect.status === 200, 'POST /calendar/connect returns HTTP 200');
    assert(
      calConnect.body.data.connected === true || !!calConnect.body.data.authUrl,
      'Calendar connect generates consent authUrl or connects in dev mode'
    );

    // Simulate verified active connection state for subsequent lifecycle tests
    await rpgStore.setCalendarConnection(userAId, {
      connected: true,
      status: 'CONNECTED',
      accountEmail: 'alice.adventurer@gmail.com'
    });

    // Get events (User A)
    const calEvents = await request('/calendar/events', {}, tokenA);
    assert(calEvents.status === 200, 'GET /calendar/events returns HTTP 200');
    assert(Array.isArray(calEvents.body.data), 'Calendar events returned as array');

    // Verify User Isolation: User B cannot access User A's calendar
    const userBCalEvents = await request('/calendar/events', {}, tokenB);
    assert(userBCalEvents.status === 200, 'GET /calendar/events for User B returns HTTP 200');
    assert(userBCalEvents.body.data.length === 0, "User B receives empty array (cannot access User A's calendar)");

    // Verify calendar events do not convert into completed quests (remains 3 from previous completed quests)
    const charAfterCal = await request('/character', {}, tokenA);
    assert(charAfterCal.body.data.completedQuestsCount === 3, 'Calendar events NEVER automatically convert into completed quests');

    // Set reauthorization required
    const calReauth = await request('/calendar/reauthorize', { method: 'POST' }, tokenA);
    assert(calReauth.status === 200, 'POST /calendar/reauthorize returns HTTP 200');
    assert(calReauth.body.data.status === 'REAUTHORIZATION_REQUIRED', 'Status is REAUTHORIZATION_REQUIRED');

    // Disconnect calendar
    const calDisc = await request('/calendar/disconnect', { method: 'POST' }, tokenA);
    assert(calDisc.status === 200, 'POST /calendar/disconnect returns HTTP 200');
    assert(calDisc.body.data.connected === false, 'Calendar is now disconnected');
    assert(calDisc.body.data.status === 'NOT_CONNECTED', 'Status is NOT_CONNECTED after disconnect');

    // Events after disconnect are empty
    const postDiscEvents = await request('/calendar/events', {}, tokenA);
    assert(postDiscEvents.body.data.length === 0, 'Events array is empty after calendar disconnect');

    // ----------------------------------------------------
    // TEST 13: True Persistence Verification Across Server Restart
    // ----------------------------------------------------
    console.log('\n▶ [13/13] Verifying Data Persistence Across Server Restart...');
    const freshStore = new RpgStore();
    const persistedUser = await freshStore.findUserByEmail(userAEmail);
    assert(!!persistedUser, 'User Alice survived server restart and exists in persisted store');

    const persistedSheet = await freshStore.getCharacterSheet(persistedUser!.id);
    assert(persistedSheet.level === 3, `Persisted Level ${persistedSheet.level} matches progression state`);
    assert(persistedSheet.totalXp >= 320, `Persisted Total XP (${persistedSheet.totalXp}) preserved`);
    assert(persistedSheet.streak === 1, 'Persisted streak is 1');

    const persistedQuests = await freshStore.getQuests(persistedUser!.id);
    const persistedEpic = persistedQuests.find(q => q.id === epicQuestId);
    assert(!!persistedEpic, 'Epic quest exists after restart');
    assert(persistedEpic!.status === 'completed', 'Completed quest status preserved across restart');

    console.log('\n======================================================');
    console.log('  🎉 ALL 13 TEST SUITES PASSED WITH ZERO ERRORS!      ');
    console.log('======================================================\n');

    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error('\n💥 TEST FAILED:', err.message);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
