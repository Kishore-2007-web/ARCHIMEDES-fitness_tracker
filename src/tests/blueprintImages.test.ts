import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { WORKOUT_SCHEDULE, COMMON_WARMUP_SECTIONS, COMMON_RECOVERY_SECTIONS } from '../data/workoutSchedule';

describe('7-Day Workout Blueprint Image Integration', () => {
  it('Public warmup-protocol.jpg exists and has non-zero size', () => {
    const publicPath = path.resolve(__dirname, '../../public/warmup-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000); // 297KB image
  });

  it('Public recovery-protocol.jpg exists and has non-zero size', () => {
    const publicPath = path.resolve(__dirname, '../../public/recovery-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000); // 291KB image
  });

  it('All days in WORKOUT_SCHEDULE have preworkoutImageUrl set to /warmup-protocol.jpg', () => {
    const allWeekdays = [1, 2, 3, 4, 5, 6, 0]; // Mon through Sun
    allWeekdays.forEach((dayNum) => {
      const day = WORKOUT_SCHEDULE[dayNum];
      expect(day).toBeDefined();
      expect(day.preworkoutImageUrl).toBe('/warmup-protocol.jpg');
      expect(day.preparationMinutes).toBeGreaterThan(0);
      expect(day.preparationSections).toBeDefined();
      expect(day.preparationSections!.length).toBeGreaterThan(0);
    });
  });

  it('All days in WORKOUT_SCHEDULE have recoveryProtocolImageUrl set to /recovery-protocol.jpg', () => {
    const allWeekdays = [1, 2, 3, 4, 5, 6, 0]; // Mon through Sun
    allWeekdays.forEach((dayNum) => {
      const day = WORKOUT_SCHEDULE[dayNum];
      expect(day).toBeDefined();
      expect(day.recoveryProtocolImageUrl).toBe('/recovery-protocol.jpg');
      expect(day.recoveryMinutes).toBeGreaterThan(0);
      expect(day.recoverySections).toBeDefined();
      expect(day.recoverySections!.length).toBeGreaterThan(0);
    });
  });

  it('COMMON_WARMUP_SECTIONS has all 3 required sections matching the warm-up graphic', () => {
    expect(COMMON_WARMUP_SECTIONS.length).toBe(3);
    expect(COMMON_WARMUP_SECTIONS[0].title).toContain('Aerobic Temperature & Joint Prep');
    expect(COMMON_WARMUP_SECTIONS[1].title).toContain('Controlled Rotations & Lower Mobility');
    expect(COMMON_WARMUP_SECTIONS[2].title).toContain('Upper Mobility & Dynamic Stretching');
  });

  it('COMMON_RECOVERY_SECTIONS has all 3 required sections matching the recovery graphic', () => {
    expect(COMMON_RECOVERY_SECTIONS.length).toBe(3);
    expect(COMMON_RECOVERY_SECTIONS[0].title).toContain('Cool-Down Transition');
    expect(COMMON_RECOVERY_SECTIONS[1].title).toContain('Lower Body & Hip Recovery');
    expect(COMMON_RECOVERY_SECTIONS[2].title).toContain('Spine & Upper Body Decompression');
  });

  it('Public saturday-exercise-protocol.jpg exists and Saturday has exerciseProtocolImageUrl', () => {
    const publicPath = path.resolve(__dirname, '../../public/saturday-exercise-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000); // 428KB image

    const saturday = WORKOUT_SCHEDULE[6];
    expect(saturday.exerciseProtocolImageUrl).toBe('/saturday-exercise-protocol.jpg');
  });

  it('Public monday-exercise-protocol.jpg exists and Monday has exerciseProtocolImageUrl', () => {
    const publicPath = path.resolve(__dirname, '../../public/monday-exercise-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000); // 312KB image

    const monday = WORKOUT_SCHEDULE[1];
    expect(monday.exerciseProtocolImageUrl).toBe('/monday-exercise-protocol.jpg');
  });

  it('Public thursday-exercise-protocol.jpg exists and Thursday has exerciseProtocolImageUrl and Zoro exercise', () => {
    const publicPath = path.resolve(__dirname, '../../public/thursday-exercise-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000);

    const thursday = WORKOUT_SCHEDULE[4];
    expect(thursday.exerciseProtocolImageUrl).toBe('/thursday-exercise-protocol.jpg');
    const zoroExercise = thursday.exercises.find((ex) => ex.id === 'deep_squat_btn_press');
    expect(zoroExercise).toBeDefined();
    expect(zoroExercise!.name).toContain('Zoro');
  });

  it('Public wednesday-exercise-protocol.jpg exists and Wednesday has exerciseProtocolImageUrl', () => {
    const publicPath = path.resolve(__dirname, '../../public/wednesday-exercise-protocol.jpg');
    expect(fs.existsSync(publicPath)).toBe(true);
    const stats = fs.statSync(publicPath);
    expect(stats.size).toBeGreaterThan(100000); // 356KB image

    const wednesday = WORKOUT_SCHEDULE[3];
    expect(wednesday.exerciseProtocolImageUrl).toBe('/wednesday-exercise-protocol.jpg');
  });
});
