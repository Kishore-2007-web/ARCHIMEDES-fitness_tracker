import { WorkoutScheduleDay } from '../types/workout';

export const WORKOUT_SCHEDULE: Record<number, WorkoutScheduleDay> = {
  // 1 = Monday
  1: {
    id: 'strength_a',
    weekday: 1,
    weekdayName: 'MONDAY',
    title: 'SQUAT + BENCH STRENGTH A',
    subtitle: 'Primary Heavy Lower & Upper Push Protocol',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationChecklist: [
      '5 min easy walking & joint lubrication',
      'Ankle mobility & deep squat hold',
      '90/90 hip switches & circles',
      'World\'s Greatest Stretch & thoracic rotation',
      'Shoulder mobility & scapular push-ups',
      'Agility footwork & lateral transitions',
      'Empty-bar squat & bench warm-up'
    ],
    exercises: [
      {
        id: 'back_squat',
        name: 'Barbell Back Squat',
        targetSets: 5,
        targetRepOrDuration: '3–5 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true
      },
      {
        id: 'bench_press',
        name: 'Barbell Bench Press',
        targetSets: 5,
        targetRepOrDuration: '3–5 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true
      },
      {
        id: 'cable_row',
        name: 'Machine / Cable Row',
        targetSets: 3,
        targetRepOrDuration: '8–10 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'romanian_deadlift',
        name: 'Romanian Deadlift',
        targetSets: 3,
        targetRepOrDuration: '6–8 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'farmer_carry',
        name: 'Farmer Carry',
        targetSets: 3,
        targetRepOrDuration: '30–45 sec',
        metricType: 'WEIGHT_DURATION',
        category: 'grip'
      },
      {
        id: 'dead_hang',
        name: 'Dead Hang',
        targetSets: 2,
        targetRepOrDuration: 'Near-max hold',
        metricType: 'DURATION',
        category: 'grip'
      }
    ],
    recoveryChecklist: [
      'Hip-flexor and hamstring stretches',
      'Calf & chest stretches',
      'Lat stretch & thoracic mobility',
      'Slow diaphragmatic breathing'
    ]
  },

  // 2 = Tuesday
  2: {
    id: 'agility_athleticism',
    weekday: 2,
    weekdayName: 'TUESDAY',
    title: 'MOBILITY + AGILITY + ATHLETICISM',
    subtitle: 'Kinetic Coordination & Elastic Capacity',
    baseXP: 200,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['agility', 'mobility', 'endurance', 'discipline'],
    preparationChecklist: [
      'Knee-to-wall, ankle circles & calf raises',
      'Deep squat hold, 90/90 & Cossack squats',
      'Hip-flexor stretch & dynamic leg swings',
      'Cat-cow, thoracic rotations & wall slides',
      'External rotation & scapular push-ups'
    ],
    exercises: [
      {
        id: 'jump_rope_tue',
        name: 'Jump Rope',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'reaction_ball_tue',
        name: 'Reaction Ball Drill',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'footwork_tue',
        name: 'Agility Footwork Drill',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic'
      }
    ],
    recoveryChecklist: [
      '15 min static stretching',
      'Diaphragmatic recovery breathing'
    ]
  },

  // 3 = Wednesday (DAY 1)
  3: {
    id: 'deadlift_strength',
    weekday: 3,
    weekdayName: 'WEDNESDAY',
    title: 'DEADLIFT + FULL BODY STRENGTH',
    subtitle: 'Posterior Chain Engine & Structural Integrity',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['strength', 'endurance', 'discipline'],
    preparationChecklist: [
      '5 min general warm-up',
      '10 min hip & hamstring mobility',
      '5 min footwork & agility prep',
      '10 min movement-specific deadlift prep'
    ],
    exercises: [
      {
        id: 'conventional_deadlift',
        name: 'Conventional Deadlift',
        targetSets: 4,
        targetRepOrDuration: '3 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true
      },
      {
        id: 'leg_press',
        name: 'Leg Press',
        targetSets: 3,
        targetRepOrDuration: '8–10 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        targetSets: 3,
        targetRepOrDuration: '8–10 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'db_bench_press',
        name: 'Dumbbell Bench Press',
        targetSets: 3,
        targetRepOrDuration: '8 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'back_extension',
        name: 'Back Extension',
        targetSets: 2,
        targetRepOrDuration: '10–12 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'grip_trainer',
        name: 'Grip Trainer',
        targetSets: 3,
        targetRepOrDuration: 'Max controlled reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'grip'
      },
      {
        id: 'neck_flexion',
        name: 'Neck Flexion (Controlled)',
        targetSets: 2,
        targetRepOrDuration: '15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Strict controlled motion. Do not load aggressively.'
      },
      {
        id: 'neck_extension',
        name: 'Neck Extension (Controlled)',
        targetSets: 2,
        targetRepOrDuration: '15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Strict controlled motion. Do not load aggressively.'
      },
      {
        id: 'neck_side_bend',
        name: 'Neck Side Bend (Controlled)',
        targetSets: 2,
        targetRepOrDuration: '15 reps/side',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Strict controlled motion. Do not load aggressively.'
      }
    ],
    recoveryChecklist: [
      'Hamstrings and glutes decompression',
      'Hips & lat recovery stretches',
      'Thoracic spine release & slow breathing'
    ]
  },

  // 4 = Thursday
  4: {
    id: 'athletic_mobility',
    weekday: 4,
    weekdayName: 'THURSDAY',
    title: 'ATHLETIC + MOBILITY',
    subtitle: 'Elastic Coordination & Aerobic Conditioning',
    baseXP: 200,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['agility', 'endurance', 'mobility'],
    preparationChecklist: [
      '10 min joint mobility',
      '10 min dynamic flexibility',
      '10 min movement preparation'
    ],
    exercises: [
      {
        id: 'jump_rope_thu',
        name: 'Jump Rope',
        targetSets: 1,
        targetRepOrDuration: '15 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'reaction_ball_thu',
        name: 'Reaction Ball Drill',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'footwork_thu',
        name: 'Footwork Drill',
        targetSets: 1,
        targetRepOrDuration: '15 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'conditioning_block',
        name: 'Conditioning (Rower / Bike / Elliptical / Brisk Walk)',
        targetSets: 1,
        targetRepOrDuration: '10–15 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Choose one modality. Non-treadmill options preferred.'
      }
    ],
    recoveryChecklist: [
      '15 min long mobility protocol',
      'Full body passive stretches'
    ]
  },

  // 5 = Friday
  5: {
    id: 'strength_b',
    weekday: 5,
    weekdayName: 'FRIDAY',
    title: 'SQUAT + BENCH STRENGTH B',
    subtitle: 'Secondary Strength Volume & Light Technique Deadlift',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationChecklist: [
      '5 min general warm-up',
      '10 min mobility drills',
      '5 min agility activation',
      '10 min squat & bench movement prep'
    ],
    exercises: [
      {
        id: 'back_squat_b',
        name: 'Barbell Back Squat',
        targetSets: 4,
        targetRepOrDuration: '4 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary'
      },
      {
        id: 'bench_press_b',
        name: 'Barbell Bench Press',
        targetSets: 4,
        targetRepOrDuration: '4 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary'
      },
      {
        id: 'light_deadlift',
        name: 'Light Trap-Bar / Conventional Deadlift',
        targetSets: 3,
        targetRepOrDuration: '5–6 reps',
        metricType: 'WEIGHT_REPS',
        category: 'secondary',
        notes: 'Strictly 50–65% load. Speed and technique only.'
      },
      {
        id: 'seated_row',
        name: 'Seated Row',
        targetSets: 3,
        targetRepOrDuration: '8–10 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'overhead_press',
        name: 'Overhead Press',
        targetSets: 3,
        targetRepOrDuration: '6–8 reps',
        metricType: 'WEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'walking_lunges',
        name: 'Walking Lunges',
        targetSets: 2,
        targetRepOrDuration: '10 reps/leg',
        metricType: 'BODYWEIGHT_REPS',
        category: 'support'
      },
      {
        id: 'wrist_curl',
        name: 'Wrist Curl',
        targetSets: 2,
        targetRepOrDuration: '12–15 reps',
        metricType: 'WEIGHT_REPS',
        category: 'forearms'
      },
      {
        id: 'reverse_curl',
        name: 'Reverse Curl',
        targetSets: 2,
        targetRepOrDuration: '12–15 reps',
        metricType: 'WEIGHT_REPS',
        category: 'forearms'
      },
      {
        id: 'wrist_rotation',
        name: 'Wrist Rotation',
        targetSets: 2,
        targetRepOrDuration: '10/direction',
        metricType: 'BODYWEIGHT_REPS',
        category: 'forearms'
      }
    ],
    recoveryChecklist: [
      '15 min full-body static stretching',
      'Shoulder and wrist relief'
    ]
  },

  // 6 = Saturday
  6: {
    id: 'calisthenics_strength',
    weekday: 6,
    weekdayName: 'SATURDAY',
    title: 'CALISTHENICS + ATHLETIC STRENGTH',
    subtitle: 'Relative Bodyweight Mastery & Functional Force',
    baseXP: 250,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 40,
    primaryAttributes: ['strength', 'endurance', 'agility', 'discipline'],
    preparationChecklist: [
      'Joint mobility & scapular activation',
      'Dynamic stretching & core temperature raise',
      'Agility footwork priming'
    ],
    exercises: [
      {
        id: 'push_ups',
        name: 'Push-ups',
        targetSets: 3,
        targetRepOrDuration: '6–15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics',
        isBenchmark: true,
        notes: 'Strict lock-out and chest-to-deck.'
      },
      {
        id: 'assisted_pull_ups',
        name: 'Assisted Pull-ups',
        targetSets: 3,
        targetRepOrDuration: '5–10 reps',
        metricType: 'ASSISTANCE_REPS',
        category: 'calisthenics',
        isBenchmark: true,
        notes: 'Log machine/band assistance in kg. Lower assistance = higher progress.'
      },
      {
        id: 'bw_squats',
        name: 'Bodyweight Squats',
        targetSets: 2,
        targetRepOrDuration: '15–20 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics'
      },
      {
        id: 'plank_hold',
        name: 'Plank Hold',
        targetSets: 3,
        targetRepOrDuration: '30–60 sec',
        metricType: 'DURATION',
        category: 'calisthenics',
        isBenchmark: true
      },
      {
        id: 'hanging_knee_raise',
        name: 'Hanging Knee Raise',
        targetSets: 3,
        targetRepOrDuration: '8–15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics'
      },
      {
        id: 'jump_rope_sat',
        name: 'Jump Rope',
        targetSets: 1,
        targetRepOrDuration: '10–15 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'reaction_ball_sat',
        name: 'Reaction Ball',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic'
      },
      {
        id: 'farmer_carry_sat',
        name: 'Farmer Carry',
        targetSets: 3,
        targetRepOrDuration: '3 rounds (30–45s)',
        metricType: 'WEIGHT_DURATION',
        category: 'grip'
      }
    ],
    recoveryChecklist: [
      '15 min mobility & stretching',
      'Shoulder and forearm decompression'
    ]
  },

  // 0 = Sunday
  0: {
    id: 'active_recovery',
    weekday: 0,
    weekdayName: 'SUNDAY',
    title: 'ACTIVE RECOVERY',
    subtitle: 'Scheduled Rest & System Restoration',
    baseXP: 100,
    preparationMinutes: 0,
    recoveryMinutes: 45,
    walkingMinutes: 45,
    primaryAttributes: ['mobility', 'endurance', 'focus'],
    preparationChecklist: [
      'System rest: No heavy lifting or combat drills'
    ],
    exercises: [
      {
        id: 'mobility_protocol',
        name: 'Low-Intensity Mobility & Flexibility',
        targetSets: 1,
        targetRepOrDuration: '30 min',
        metricType: 'CHECK_ONLY',
        category: 'support'
      },
      {
        id: 'recovery_stretching',
        name: 'Recovery Stretching & Breathing',
        targetSets: 1,
        targetRepOrDuration: '15 min',
        metricType: 'CHECK_ONLY',
        category: 'support'
      },
      {
        id: 'recovery_walk',
        name: 'Continuous Recovery Walk',
        targetSets: 1,
        targetRepOrDuration: '45 min',
        metricType: 'TIME_BLOCK',
        category: 'athletic'
      }
    ],
    recoveryChecklist: [
      'Complete 45 min walking in open air',
      'Diaphragmatic breathwork to downregulate CNS'
    ]
  }
};
