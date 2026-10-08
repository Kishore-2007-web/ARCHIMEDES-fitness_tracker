import { WorkoutScheduleDay, PreparationSection, ExerciseDefinition } from '../types/workout';

// 15-Exercise Common Warm-Up Protocol (18–22 min)
export const COMMON_WARMUP_CHECKLIST: string[] = [
  '1. Stationary Bike — 5 min',
  '2. Ankle Circles — 10 each direction/ankle',
  '3. Wrist Circles — 10 each direction',
  '4. Elbow Circles — 10 each direction',
  '5. Arm Circles — 10 forward + 10 backward',
  '6. Neck Controlled Rotations — 5 each direction',
  '7. Hip Circles — 10 each direction',
  '8. Leg Swings — 10–12 each direction/leg',
  '9. Bodyweight Squats — 2 × 10',
  '10. Cross-Body Stretch — 8–10/side',
  '11. Overhead Lat Stretch — 20 sec/side',
  '12. Overhead Triceps Stretch — 20 sec/side',
  '13. Stick Shoulder Stretch — 8–10 reps',
  '14. Your Leg Stretch — 20 sec/side',
  '15. Doorway Chest Stretch — 15–20 sec/side'
];

export const COMMON_WARMUP_SECTIONS: PreparationSection[] = [
  {
    title: 'Aerobic Temperature & Joint Prep (5–7 min)',
    duration: '5–7 min',
    items: [
      'Stationary Bike — 5 min',
      'Ankle Circles — 10 each direction/ankle',
      'Wrist Circles — 10 each direction',
      'Elbow Circles — 10 each direction',
      'Arm Circles — 10 forward + 10 backward'
    ]
  },
  {
    title: 'Controlled Rotations & Lower Mobility (7–8 min)',
    duration: '7–8 min',
    items: [
      'Neck Controlled Rotations — 5 each direction',
      'Hip Circles — 10 each direction',
      'Leg Swings — 10–12 each direction/leg',
      'Bodyweight Squats — 2 × 10'
    ]
  },
  {
    title: 'Upper Mobility & Dynamic Stretching (6–7 min)',
    duration: '6–7 min',
    items: [
      'Cross-Body Stretch — 8–10/side',
      'Overhead Lat Stretch — 20 sec/side',
      'Overhead Triceps Stretch — 20 sec/side',
      'Stick Shoulder Stretch — 8–10 reps',
      'Your Leg Stretch — 20 sec/side',
      'Doorway Chest Stretch — 15–20 sec/side'
    ]
  }
];

// 13-Exercise Common Recovery & Stretch Protocol (~15 min)
export const COMMON_RECOVERY_CHECKLIST: string[] = [
  '1. Easy Walking — 3 min',
  '2. Standing Quad Stretch — 20–30 sec/leg',
  '3. Hip-Flexor Stretch — 20–30 sec/side',
  '4. Hamstring Stretch — 20–30 sec/side',
  '5. Calf Stretch — 20–30 sec/side',
  '6. 90/90 Hip Stretch — 30 sec/side',
  "7. Child's Pose — 30–45 sec",
  '8. Cat-Cow — 6–8 reps',
  '9. Doorway Chest Stretch — 20–30 sec/side',
  '10. Cross-Body Shoulder Stretch — 20–30 sec/side',
  '11. Overhead Lat Stretch — 20–30 sec/side',
  '12. Overhead Triceps Stretch — 20–30 sec/side',
  '13. Deep Breathing — 1–2 min'
];

export const COMMON_RECOVERY_SECTIONS: PreparationSection[] = [
  {
    title: 'Cool-Down Transition (3 min)',
    duration: '3 min',
    items: ['Easy Walking — 3 min']
  },
  {
    title: 'Lower Body & Hip Recovery (6 min)',
    duration: '6 min',
    items: [
      'Standing Quad Stretch — 20–30 sec/leg',
      'Hip-Flexor Stretch — 20–30 sec/side',
      'Hamstring Stretch — 20–30 sec/side',
      'Calf Stretch — 20–30 sec/side',
      '90/90 Hip Stretch — 30 sec/side'
    ]
  },
  {
    title: 'Spine & Upper Body Decompression (6 min)',
    duration: '6 min',
    items: [
      "Child's Pose — 30–45 sec",
      'Cat-Cow — 6–8 reps',
      'Doorway Chest Stretch — 20–30 sec/side',
      'Cross-Body Shoulder Stretch — 20–30 sec/side',
      'Overhead Lat Stretch — 20–30 sec/side',
      'Overhead Triceps Stretch — 20–30 sec/side',
      'Deep Breathing — 1–2 min'
    ]
  }
];

export const WORKOUT_SCHEDULE: Record<number, WorkoutScheduleDay> = {
  // 1 = MONDAY: Squat + Bench Strength A
  1: {
    id: 'strength_a',
    weekday: 1,
    weekdayName: 'MONDAY',
    title: 'SQUAT + BENCH STRENGTH A',
    subtitle: 'Primary Barbell Strength Protocol',
    baseXP: 300,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Primary strength day focusing on heavy barbell mechanics, upper pull support and grip fortitude.',
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'back_squat',
        name: 'Barbell Back Squat',
        targetSets: 5,
        targetRepOrDuration: '3–5',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Primary lower body strength lift. Full depth, upright torso, controlled descent.'
      },
      {
        id: 'bench_press',
        name: 'Barbell Bench Press',
        targetSets: 5,
        targetRepOrDuration: '3–5',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Primary upper push strength lift. Retract scapulae, touch lower sternum.'
      },
      {
        id: 'cable_row',
        name: 'Machine/Cable Row',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Strict horizontal pull. Full contraction at chest level.'
      },
      {
        id: 'farmer_carry',
        name: 'Farmer Carry',
        targetSets: 3,
        targetRepOrDuration: '30–45 sec',
        metricType: 'WEIGHT_DURATION',
        category: 'grip',
        notes: 'Heavy loaded walk. Tall posture, packed shoulders.'
      },
      {
        id: 'dead_hang',
        name: 'Dead Hang',
        targetSets: 2,
        targetRepOrDuration: 'near-max',
        metricType: 'DURATION',
        category: 'grip',
        notes: 'Passive shoulder hang. Near-max comfortable duration.'
      },
      {
        id: 'cable_triceps_pushdown',
        name: 'Cable Triceps Pushdown',
        targetSets: 3,
        targetRepOrDuration: '8–12',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Elbows pinned to sides, full triceps extension.'
      },
      {
        id: 'calf_raises',
        name: 'Calf Raises',
        targetSets: 3,
        targetRepOrDuration: '10–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Pause 2 sec at peak contraction, controlled stretch at bottom.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 2 = TUESDAY: Shoulders + Arms
  2: {
    id: 'shoulders_arms',
    weekday: 2,
    weekdayName: 'TUESDAY',
    title: 'SHOULDERS + ARMS',
    subtitle: 'Overhead Mechanics & Arm Architecture',
    baseXP: 200,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Deltoid overhead mechanics, rotator cuff integrity, and isolated arm training.',
    primaryAttributes: ['strength', 'mobility', 'discipline'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'landmine_press',
        name: 'Landmine Press',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        notes: 'Standing unilateral press. Lean slightly into the bar with core tight.'
      },
      {
        id: 'bottoms_up_kb_carry',
        name: 'Bottoms-Up Kettlebell Carry',
        targetSets: 3,
        targetRepOrDuration: '20–30 m/side',
        metricType: 'WEIGHT_DURATION',
        category: 'grip',
        notes: 'Inverted kettlebell. 90-degree elbow lock, extreme grip and shoulder stabilization.'
      },
      {
        id: 'cable_band_external_rotation',
        name: 'Cable/Band External Rotation',
        targetSets: 3,
        targetRepOrDuration: '12–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Infraspinatus & teres minor isolation. Keep elbow pinned to side.'
      },
      {
        id: 'face_pull',
        name: 'Face Pull',
        targetSets: 3,
        targetRepOrDuration: '12–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Pull towards eye level with external rotation at finish.'
      },
      {
        id: 'hammer_curl',
        name: 'Hammer Curl',
        targetSets: 3,
        targetRepOrDuration: '8–12',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Neutral grip for brachialis and brachioradialis development.'
      },
      {
        id: 'plate_pinch_hold',
        name: 'Plate Pinch Hold',
        targetSets: 3,
        targetRepOrDuration: '20–40 sec',
        metricType: 'WEIGHT_DURATION',
        category: 'grip',
        notes: 'Pinch smooth plates between fingers and thumb. Timed holds.'
      },
      {
        id: 'mobility_block',
        name: 'Mobility',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'recovery',
        notes: 'Dedicated 10-minute shoulder capsule and thoracic mobility block.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 3 = WEDNESDAY: Deadlift + Full Body Strength
  3: {
    id: 'deadlift_strength',
    weekday: 3,
    weekdayName: 'WEDNESDAY',
    title: 'DEADLIFT + FULL BODY STRENGTH',
    subtitle: 'Posterior Chain Overload & Full-Body Density',
    baseXP: 300,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Main deadlift session. Pull from a dead stop with strict form and progressive overload.',
    primaryAttributes: ['strength', 'endurance', 'discipline'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'conventional_deadlift',
        name: 'Conventional Deadlift',
        targetSets: 4,
        targetRepOrDuration: '3',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Primary hinge lift. Reset each repetition from the floor, neutral spine.'
      },
      {
        id: 'leg_press',
        name: 'Leg Press',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'secondary',
        notes: 'Quad & glute hypertrophy. Full knee flexion without pelvic rounding.'
      },
      {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Vertical pulling strength. Drive elbows down to hips.'
      },
      {
        id: 'dumbbell_bench_press',
        name: 'Dumbbell Bench Press',
        targetSets: 3,
        targetRepOrDuration: '8',
        metricType: 'WEIGHT_REPS',
        category: 'secondary',
        notes: 'Unilateral chest loading, deep stretch at bottom position.'
      },
      {
        id: 'back_extension',
        name: 'Back Extension',
        targetSets: 2,
        targetRepOrDuration: '10–12',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Hamstring and spinal erector endurance. Hinge at hips.'
      },
      {
        id: 'grip_trainer',
        name: 'Grip Trainer',
        targetSets: 3,
        targetRepOrDuration: '3 sets',
        metricType: 'CHECK_ONLY',
        category: 'grip',
        notes: 'Crush grip hand gripper working sets.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 4 = THURSDAY: Athletic + Core + Neck
  4: {
    id: 'athletic_core_neck',
    weekday: 4,
    weekdayName: 'THURSDAY',
    title: 'ATHLETIC + CORE + NECK',
    subtitle: 'Explosive Power, Midsection Tension & Cervical Health',
    baseXP: 200,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Comprehensive athleticism, cervical integrity, and anti-rotational core fortitude.',
    primaryAttributes: ['agility', 'endurance', 'mobility'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'sled_push',
        name: 'Sled Push',
        targetSets: 4,
        targetRepOrDuration: '20–30 m',
        metricType: 'WEIGHT_DURATION',
        category: 'athletic',
        notes: 'Heavy turf drive. Low forward lean, aggressive foot plant.'
      },
      {
        id: 'high_pull_upright_row',
        name: 'Barbell/Dumbbell High Pull OR Upright Row',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'athletic',
        notes: 'Explosive triple extension into high pull or strict upright row.'
      },
      {
        id: 'shrugs',
        name: 'Shrugs',
        targetSets: 3,
        targetRepOrDuration: '10–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Upper trapezius elevation. 2-second hold at top.'
      },
      {
        id: 'neck_isometric_press',
        name: 'Dumbbell/Plate Isometric Neck Press',
        targetSets: 2,
        targetRepOrDuration: '15–20 sec/direction',
        metricType: 'DURATION',
        category: 'neck',
        notes: 'Controlled isometric resistance in 4 cardinal directions (front, back, left, right).'
      },
      {
        id: 'deep_squat_btn_press',
        name: 'Deep-Squat Behind-the-Neck Barbell Press',
        targetSets: 3,
        targetRepOrDuration: '6–8',
        metricType: 'WEIGHT_REPS',
        category: 'athletic',
        notes: 'Thoracic extension and hip mobility. Light bar pressed overhead from deep squat.'
      },
      {
        id: 'cable_crunch',
        name: 'Cable Crunch',
        targetSets: 3,
        targetRepOrDuration: '10–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Spinal flexion under cable load. Isolate rectus abdominis.'
      },
      {
        id: 'pallof_press',
        name: 'Pallof Press',
        targetSets: 3,
        targetRepOrDuration: '10–12/side',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Anti-rotation core tension. Slow controlled press and return.'
      },
      {
        id: 'dead_bug',
        name: 'Dead Bug',
        targetSets: 3,
        targetRepOrDuration: '8–12/side',
        metricType: 'BODYWEIGHT_REPS',
        category: 'support',
        notes: 'Keep lumbar spine flat against the floor throughout movement.'
      },
      {
        id: 'footwork_block',
        name: 'Footwork',
        targetSets: 1,
        targetRepOrDuration: '10–15 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Ladder, cone, or line agility drills. Rapid direction changes.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 5 = FRIDAY: Squat + Bench Strength B
  5: {
    id: 'strength_b',
    weekday: 5,
    weekdayName: 'FRIDAY',
    title: 'SQUAT + BENCH STRENGTH B',
    subtitle: 'Compound Volume & Dynamic Press Wave',
    baseXP: 300,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Secondary strength session emphasizing sub-maximal bar velocity and hypertrophy.',
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'back_squat',
        name: 'Back Squat',
        targetSets: 4,
        targetRepOrDuration: '4',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: '4 sets of 4 reps at solid working weight. Powerful ascent.'
      },
      {
        id: 'bench_press',
        name: 'Bench Press',
        targetSets: 4,
        targetRepOrDuration: '4',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: '4 sets of 4 reps. Tight arch, drive through feet.'
      },
      {
        id: 'seated_row',
        name: 'Seated Row',
        targetSets: 3,
        targetRepOrDuration: '8–10',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Mid-back thickness. Squeeze shoulder blades together.'
      },
      {
        id: 'overhead_press',
        name: 'Overhead Press',
        targetSets: 3,
        targetRepOrDuration: '6–8',
        metricType: 'WEIGHT_REPS',
        category: 'secondary',
        notes: 'Standing strict barbell press. Glutes tight, full lockout overhead.'
      },
      {
        id: 'reverse_curls',
        name: 'Reverse Curls',
        targetSets: 2,
        targetRepOrDuration: '12–15',
        metricType: 'WEIGHT_REPS',
        category: 'forearms',
        notes: 'Overhand grip for forearm and wrist stability.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 6 = SATURDAY: Calisthenics + Athletic
  6: {
    id: 'calisthenics_athletic',
    weekday: 6,
    weekdayName: 'SATURDAY',
    title: 'CALISTHENICS + ATHLETIC',
    subtitle: 'Relative Bodyweight Mastery & Functional Force',
    baseXP: 250,
    preparationMinutes: 20,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Relative bodyweight mastery and functional conditioning.',
    primaryAttributes: ['strength', 'endurance', 'agility', 'discipline'],
    preparationSections: COMMON_WARMUP_SECTIONS,
    preparationChecklist: COMMON_WARMUP_CHECKLIST,
    exercises: [
      {
        id: 'pullup_progression',
        name: 'Pull-up Progression',
        targetSets: 3,
        targetRepOrDuration: '3 sets',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics',
        isBenchmark: true,
        notes: 'Progression from dead hangs/assisted/eccentrics to strict pull-ups.'
      },
      {
        id: 'pushup_progression',
        name: 'Push-up Progression',
        targetSets: 3,
        targetRepOrDuration: '3 sets',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics',
        isBenchmark: true,
        notes: 'Strict controlled push-ups. Hands slightly wider than shoulders.'
      },
      {
        id: 'bodyweight_squat',
        name: 'Bodyweight Squat',
        targetSets: 3,
        targetRepOrDuration: '10–15',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics',
        notes: 'Full range of motion, rhythmic controlled tempo.'
      },
      {
        id: 'farmer_carry',
        name: 'Farmer Carry',
        targetSets: 3,
        targetRepOrDuration: '30–45 sec',
        metricType: 'WEIGHT_DURATION',
        category: 'grip',
        notes: 'Heavy loaded carry. Upright spine, smooth forward stride.'
      },
      {
        id: 'calf_raises',
        name: 'Calf Raises',
        targetSets: 3,
        targetRepOrDuration: '12–15',
        metricType: 'WEIGHT_REPS',
        category: 'support',
        notes: 'Single leg or double leg standing calf raise.'
      }
    ],
    recoverySections: COMMON_RECOVERY_SECTIONS,
    recoveryChecklist: COMMON_RECOVERY_CHECKLIST
  },

  // 0 = SUNDAY: Active Recovery
  0: {
    id: 'active_recovery',
    weekday: 0,
    weekdayName: 'SUNDAY',
    title: 'ACTIVE RECOVERY',
    subtitle: 'System Restoration, Joint Flushing & Aerobic Reset',
    baseXP: 100,
    preparationMinutes: 0,
    recoveryMinutes: 45,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Active recovery day. No heavy loads. Flush lactate, mobilize joints, reset autonomic nervous system.',
    primaryAttributes: ['mobility', 'endurance', 'focus'],
    preparationSections: [],
    preparationChecklist: [],
    exercises: [
      {
        id: 'easy_walking',
        name: 'Easy Walking',
        targetSets: 1,
        targetRepOrDuration: '30–45 min',
        metricType: 'DURATION',
        category: 'recovery',
        notes: 'Low-intensity outdoor or indoor walk for aerobic flushing.'
      },
      {
        id: 'light_stretching',
        name: 'Light Stretching',
        targetSets: 1,
        targetRepOrDuration: '10–15 min',
        metricType: 'DURATION',
        category: 'recovery',
        notes: 'Gentle mobility and static stretching through major muscle groups.'
      },
      {
        id: 'optional_deep_breathing',
        name: 'Optional deep breathing',
        targetSets: 1,
        targetRepOrDuration: '2–5 min',
        metricType: 'DURATION',
        category: 'recovery',
        notes: 'Parasympathetic box breathing or diaphragmatic relaxation.'
      }
    ],
    recoverySections: [
      {
        title: 'Sunday Recovery Protocol',
        duration: '45 min',
        items: [
          'Easy Walking — 30–45 min',
          'Light Stretching — 10–15 min',
          'Optional deep breathing — 2–5 min'
        ]
      }
    ],
    recoveryChecklist: [
      'Easy Walking — 30–45 min',
      'Light Stretching — 10–15 min',
      'Optional deep breathing — 2–5 min'
    ]
  }
};
