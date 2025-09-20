import { extractFirstEmoji, isSingleEmoji } from './extract-first-emoji';

describe('extractFirstEmoji', () => {
  it('should extract the first emoji from a string with multiple emojis', () => {
    expect(extractFirstEmoji('😀🚀✅')).toBe('😀');
    expect(extractFirstEmoji('🎉🎊🎈')).toBe('🎉');
    expect(extractFirstEmoji('❤️💙💚')).toBe('❤️');
  });

  it('should extract the first emoji from a string with emojis and text', () => {
    expect(extractFirstEmoji('Hello 😀 world')).toBe('😀');
    expect(extractFirstEmoji('🚀 Rocket ship')).toBe('🚀');
    expect(extractFirstEmoji('Task ✅ completed')).toBe('✅');
  });

  it('should return empty string for strings without emojis', () => {
    expect(extractFirstEmoji('Hello world')).toBe('');
    expect(extractFirstEmoji('123')).toBe('');
    expect(extractFirstEmoji('')).toBe('');
  });

  it('should handle edge cases', () => {
    expect(extractFirstEmoji('   ')).toBe('');
    expect(extractFirstEmoji('😀')).toBe('😀');
    expect(extractFirstEmoji('😀 ')).toBe('😀');
  });

  it('should handle emojis with skin tone modifiers', () => {
    expect(extractFirstEmoji('👍🏻👍🏿')).toBe('👍🏻');
    expect(extractFirstEmoji('👋🏽 Hello')).toBe('👋🏽');
  });
});

describe('isSingleEmoji', () => {
  it('should return true for single emojis', () => {
    expect(isSingleEmoji('😀')).toBe(true);
    expect(isSingleEmoji('🚀')).toBe(true);
    expect(isSingleEmoji('✅')).toBe(true);
  });

  it('should return true for emojis with skin tone modifiers', () => {
    expect(isSingleEmoji('👍🏻')).toBe(true);
    expect(isSingleEmoji('👋🏽')).toBe(true);
  });

  it('should return false for multiple emojis', () => {
    expect(isSingleEmoji('😀🚀')).toBe(false);
    expect(isSingleEmoji('🎉🎊')).toBe(false);
  });

  it('should return false for emojis with text', () => {
    expect(isSingleEmoji('😀 Hello')).toBe(false);
    expect(isSingleEmoji('Hello 😀')).toBe(false);
  });

  it('should return false for non-emoji strings', () => {
    expect(isSingleEmoji('Hello')).toBe(false);
    expect(isSingleEmoji('123')).toBe(false);
    expect(isSingleEmoji('')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isSingleEmoji('   ')).toBe(false);
    expect(isSingleEmoji('😀 ')).toBe(true); // Trimming removes the space
  });
});
