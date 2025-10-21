import { createHarmonyDataClient } from '../provider';

describe('createHarmonyDataClient', () => {
  it('returns seeded chat messages deterministically', async () => {
    const client = createHarmonyDataClient();
    const sessions = await client.chat.sessions.list();
    expect(sessions).toHaveLength(1);

    const [session] = sessions;
    const messages = await client.chat.messages(session.id);
    expect(messages.map(({ content }) => content)).toEqual([
      'What changed in the budget this week?',
      'Net change +2.1% driven by contractor spend; see Tasks for mitigation.',
    ]);
  });

  it('resets providers to seeded state', async () => {
    const client = createHarmonyDataClient();
    const [session] = await client.chat.sessions.list();

    await client.chat.appendMessage(session.id, {
      role: 'user',
      content: 'Follow up question?',
    });

    const mutatedMessages = await client.chat.messages(session.id);
    expect(mutatedMessages).toHaveLength(3);

    client.resetAll();
    const resetMessages = await client.chat.messages(session.id);
    expect(resetMessages).toHaveLength(2);
  });
});
