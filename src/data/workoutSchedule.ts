import { WorkoutScheduleDay } from '../types/workout';

export const WORKOUT_SCHEDULE: Record<number, WorkoutScheduleDay> = {
  // 1 = MONDAY
  1: {
    id: 'strength_a',
    weekday: 1,
    weekdayName: 'MONDAY',
    title: 'SQUAT + BENCH STRENGTH A',
    subtitle: 'Primary Heavy Lower & Upper Push Protocol',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Primary strength day focusing on heavy barbell mechanics, upper pull support and grip fortitude.',
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationSections: [
      {
        title: 'General warm-up',
        duration: '5 min',
        items: ['Easy walking', 'Joint movement', 'Gradually raise body temperature']
      },
      {
        title: 'Mobility',
        duration: '10 min',
        items: [
          'Ankle mobility',
          'Deep squat hold',
          '90/90 switches',
          'Hip circles',
          "World's Greatest Stretch",
          'Thoracic rotations',
          'Shoulder mobility'
        ]
      },
      {
        title: 'Agility',
        duration: '5 min',
        items: ['Low-intensity footwork', 'Lateral movement', 'Controlled direction changes']
      },
      {
        title: 'Dynamic preparation',
        duration: '10 min',
        items: [
          'Bodyweight squats',
          'Glute bridges',
          'Leg swings',
          'Scapular push-ups',
          'Empty-bar squat',
          'Empty-bar bench preparation'
        ]
      }
    ],
    preparationChecklist: [
      'General warm-up (5 min: easy walk & joint movement)',
      'Mobility (10 min: ankles, deep squat hold, 90/90, hip circles, WGS, thoracic, shoulders)',
      'Agility (5 min: low-intensity footwork & lateral changes)',
      'Dynamic preparation (10 min: squats, glute bridges, leg swings, empty-bar squat & bench)'
    ],
    exercises: [
      {
        id: 'back_squat',
        name: 'Barbell Back Squat',
        targetSets: 5,
        targetRepOrDuration: '3–5 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Primary strength lift. Controlled descent, powerful drive.'
      },
      {
        id: 'bench_press',
        name: 'Barbell Bench Press',
        targetSets: 5,
        targetRepOrDuration: '3–5 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Primary strength lift. Retract scapulae, touch lower sternum.'
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
        category: 'support',
        notes: 'Hinge back at the hips, neutral spine, hamstring load.'
      },
      {
        id: 'farmer_carry',
        name: 'Farmer Carry',
        targetSets: 3,
        targetRepOrDuration: '30–45 sec',
        metricType: 'WEIGHT_DURATION',
        category: 'support'
      },
      {
        id: 'dead_hang',
        name: 'Dead Hang',
        targetSets: 2,
        targetRepOrDuration: 'Near-max comfortable hold',
        metricType: 'DURATION',
        category: 'support'
      }
    ],
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Hip-flexor stretch',
          'Hamstring stretch',
          'Calf stretch',
          'Chest stretch',
          'Lat stretch',
          'Thoracic mobility',
          'Slow breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Hip-flexor stretch',
      'Hamstring stretch',
      'Calf stretch',
      'Chest stretch',
      'Lat stretch',
      'Thoracic mobility',
      'Slow diaphragmatic breathing'
    ]
  },

  // 2 = TUESDAY
  2: {
    id: 'agility_athleticism',
    weekday: 2,
    weekdayName: 'TUESDAY',
    title: 'MOBILITY + AGILITY + ATHLETICISM',
    subtitle: 'Kinetic Coordination & Elastic Capacity',
    baseXP: 200,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'This is not another heavy lifting day. Focus on efficiency, elasticity, balance and reaction without combat application.',
    primaryAttributes: ['agility', 'mobility', 'endurance', 'discipline'],
    preparationSections: [
      {
        title: 'Lower body mobility',
        duration: '10 min',
        items: [
          'Knee-to-wall',
          'Ankle circles',
          'Calf raises',
          'Deep squat hold',
          '90/90',
          'Cossack squat',
          'Hip circles',
          'Hip-flexor stretch'
        ]
      },
      {
        title: 'Dynamic preparation',
        duration: '10 min',
        items: [
          'Leg swings',
          'Hamstring sweeps',
          "World's Greatest Stretch"
        ]
      },
      {
        title: 'Upper body mobility',
        duration: '10 min',
        items: [
          'Cat-cow',
          'Thoracic rotations',
          'Wall slides',
          'External rotation',
          'Scapular push-ups',
          'Wrist circles'
        ]
      }
    ],
    preparationChecklist: [
      'Lower body (knee-to-wall, ankle circles, calf raises, deep squat hold, 90/90, cossack, hip circles/flexors)',
      'Dynamic preparation (leg swings, hamstring sweeps, World’s Greatest Stretch)',
      'Upper body (cat-cow, thoracic rotations, wall slides, external rotation, scapular push-ups, wrist circles)'
    ],
    exercises: [
      {
        id: 'jump_rope_tue',
        name: 'Jump Rope',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Continuous light cadence. Focus on acceleration, deceleration and balance.'
      },
      {
        id: 'reaction_ball_tue',
        name: 'Reaction Ball',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Sharp reaction, visual tracking and multidirectional coordination.'
      },
      {
        id: 'footwork_tue',
        name: 'Footwork',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Lateral transitions, quick direction changes, balance. No combat application.'
      }
    ],
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Longer static stretching',
          'Deep diaphragmatic breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Longer static stretching',
      'Deep diaphragmatic breathing'
    ]
  },

  // 3 = WEDNESDAY
  3: {
    id: 'deadlift_strength',
    weekday: 3,
    weekdayName: 'WEDNESDAY',
    title: 'DEADLIFT + FULL BODY STRENGTH',
    subtitle: 'Posterior Chain Engine & Structural Integrity',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'This is your main deadlift day. Heavy + technically clean + progressive. Do not push to failure.',
    primaryAttributes: ['strength', 'endurance', 'discipline'],
    preparationSections: [
      {
        title: 'General warm-up',
        duration: '5 min',
        items: ['General warm-up & joint movement']
      },
      {
        title: 'Mobility',
        duration: '10 min',
        items: ['Hip & hamstring mobility', 'Deep squat & thoracic rotation']
      },
      {
        title: 'Agility',
        duration: '5 min',
        items: ['Low-intensity footwork & agility priming']
      },
      {
        title: 'Movement-specific preparation',
        duration: '10 min',
        items: ['Hip hinge patterning', 'Glute bridges', 'Empty-bar deadlift progression']
      }
    ],
    preparationChecklist: [
      '5 min general warm-up',
      '10 min mobility (hips, hamstrings, thoracic)',
      '5 min agility priming',
      '10 min movement-specific preparation (hinge, glute bridges, light bar)'
    ],
    exercises: [
      {
        id: 'conventional_deadlift',
        name: 'Conventional Deadlift',
        targetSets: 4,
        targetRepOrDuration: '3 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary',
        isBenchmark: true,
        notes: 'Objective: Heavy + technically clean + progressive. Do not push to failure.'
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
        targetRepOrDuration: '3 sets',
        metricType: 'BODYWEIGHT_REPS',
        category: 'grip'
      },
      {
        id: 'neck_flexion',
        name: 'Neck Flexion',
        targetSets: 2,
        targetRepOrDuration: '15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Keep neck work controlled—no aggressive loading.'
      },
      {
        id: 'neck_extension',
        name: 'Neck Extension',
        targetSets: 2,
        targetRepOrDuration: '15 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Keep neck work controlled—no aggressive loading.'
      },
      {
        id: 'neck_side_bend',
        name: 'Neck Side Bend',
        targetSets: 2,
        targetRepOrDuration: '15 reps/side',
        metricType: 'BODYWEIGHT_REPS',
        category: 'neck',
        notes: 'Keep neck work controlled—no aggressive loading.'
      }
    ],
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Hamstring stretch',
          'Hip openers',
          'Glute stretches',
          'Lat stretches',
          'Thoracic spine release',
          'Slow diaphragmatic breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Full-body stretching emphasizing hamstrings, hips, glutes, lats & thoracic spine',
      'Slow diaphragmatic breathing'
    ]
  },

  // 4 = THURSDAY
  4: {
    id: 'athletic_mobility',
    weekday: 4,
    weekdayName: 'THURSDAY',
    title: 'ATHLETIC + MOBILITY DAY',
    subtitle: 'Coordination, Reaction, Balance & Conditioning',
    baseXP: 200,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'Instead of turning Thursday into another strength session, we use it to develop the qualities that heavy lifting doesn’t fully cover.',
    primaryAttributes: ['agility', 'endurance', 'mobility'],
    preparationSections: [
      {
        title: 'Joint / mobility sequence',
        duration: '10 min',
        items: ['Joint rotations', 'Ankle & hip mobility', 'Spine mobility']
      },
      {
        title: 'Dynamic flexibility',
        duration: '10 min',
        items: ['Leg swings & sweeps', "World's Greatest Stretch", 'Lateral lunges']
      },
      {
        title: 'Movement preparation',
        duration: '10 min',
        items: ['Light skipping', 'Balance & reaction priming']
      }
    ],
    preparationChecklist: [
      '10 min joint/mobility sequence',
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
        category: 'athletic',
        notes: 'Rhythm, elasticity, reactive ankle stiffness.'
      },
      {
        id: 'reaction_ball_thu',
        name: 'Reaction Ball',
        targetSets: 1,
        targetRepOrDuration: '10 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Hand-eye coordination, peripheral vision.'
      },
      {
        id: 'footwork_thu',
        name: 'Footwork',
        targetSets: 1,
        targetRepOrDuration: '15 min',
        metricType: 'DURATION',
        category: 'athletic',
        notes: 'Acceleration, deceleration, balance, and movement efficiency.'
      },
      {
        id: 'conditioning_thu',
        name: 'Conditioning (Rower / Bike / Elliptical / Outdoor Brisk Walk)',
        targetSets: 1,
        targetRepOrDuration: '10–15 min',
        metricType: 'DURATION',
        category: 'conditioning',
        notes: 'Choose available modality: rowing machine, stationary bike, elliptical, or outdoor brisk walk. No treadmill needed.'
      }
    ],
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Long mobility session',
          'Static flexibility stretches',
          'Parasympathetic breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Long mobility session',
      'Parasympathetic breathing'
    ]
  },

  // 5 = FRIDAY
  5: {
    id: 'strength_b',
    weekday: 5,
    weekdayName: 'FRIDAY',
    title: 'SQUAT + BENCH STRENGTH B',
    subtitle: 'Secondary Strength Volume & Light Technique Deadlift',
    baseXP: 300,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'This is your second major strength day. Light deadlift is strictly 50–65% technique work.',
    primaryAttributes: ['strength', 'discipline', 'focus'],
    preparationSections: [
      {
        title: 'General warm-up',
        duration: '5 min',
        items: ['Easy walking & joint movement', 'Gradually raise body temperature']
      },
      {
        title: 'Mobility',
        duration: '10 min',
        items: ['Ankle mobility & deep squat hold', '90/90 switches & hip circles', 'Thoracic rotations & shoulder mobility']
      },
      {
        title: 'Agility',
        duration: '5 min',
        items: ['Low-intensity footwork & lateral changes']
      },
      {
        title: 'Movement preparation',
        duration: '10 min',
        items: ['Bodyweight squats & glute bridges', 'Empty-bar squat and bench prep']
      }
    ],
    preparationChecklist: [
      '5 min general warm-up',
      '10 min mobility',
      '5 min agility',
      '10 min movement preparation'
    ],
    exercises: [
      {
        id: 'back_squat_b',
        name: 'Back Squat',
        targetSets: 4,
        targetRepOrDuration: '4 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary'
      },
      {
        id: 'bench_press_b',
        name: 'Bench Press',
        targetSets: 4,
        targetRepOrDuration: '4 reps',
        metricType: 'WEIGHT_REPS',
        category: 'primary'
      },
      {
        id: 'light_deadlift',
        name: 'Light Trap-Bar Deadlift OR Light Conventional Deadlift',
        targetSets: 3,
        targetRepOrDuration: '5–6 reps',
        metricType: 'WEIGHT_REPS',
        category: 'secondary',
        notes: 'Keep it genuinely light (~50–65% of normal working capability). This is NOT another heavy deadlift day.'
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
        targetRepOrDuration: '10/leg',
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
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Full-body stretching',
          'Hip-flexor, hamstring, calf, chest & lat stretches',
          'Forearm & wrist release',
          'Slow breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Full-body stretching',
      'Forearm and wrist relief',
      'Slow diaphragmatic breathing'
    ]
  },

  // 6 = SATURDAY
  6: {
    id: 'calisthenics_strength',
    weekday: 6,
    weekdayName: 'SATURDAY',
    title: 'CALISTHENICS + ATHLETIC STRENGTH',
    subtitle: 'Relative Bodyweight Mastery & Functional Force',
    baseXP: 250,
    preparationMinutes: 30,
    recoveryMinutes: 15,
    walkingMinutes: 45,
    walkingRange: '30–45 min',
    dayNote: 'This day is designed to help you become strong relative to your bodyweight, not simply stronger on barbells.',
    primaryAttributes: ['strength', 'endurance', 'agility', 'discipline'],
    preparationSections: [
      {
        title: '30-Min Preparation',
        duration: '30 min',
        items: [
          'Mobility & joint movement',
          'Dynamic stretching & core temperature raise',
          'Agility footwork priming'
        ]
      }
    ],
    preparationChecklist: [
      'Mobility + dynamic stretching + agility'
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
        notes: 'Current max is ~3. Start with a version that allows clean repetitions if necessary.'
      },
      {
        id: 'assisted_pull_ups',
        name: 'Assisted Pull-ups',
        targetSets: 3,
        targetRepOrDuration: '5–10 reps',
        metricType: 'ASSISTANCE_REPS',
        category: 'calisthenics',
        isBenchmark: true,
        notes: 'Goal progression: 0 → 1 → 3 → 5 → 10 pull-ups. Log assistance in kg.'
      },
      {
        id: 'bw_squats',
        name: 'Bodyweight Squat',
        targetSets: 2,
        targetRepOrDuration: '15–20 reps',
        metricType: 'BODYWEIGHT_REPS',
        category: 'calisthenics'
      },
      {
        id: 'plank_hold',
        name: 'Plank',
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
        targetRepOrDuration: '3 rounds',
        metricType: 'WEIGHT_DURATION',
        category: 'grip'
      }
    ],
    recoverySections: [
      {
        title: '15-Min Recovery',
        duration: '15 min',
        items: [
          'Mobility + stretching',
          'Chest, shoulder & lats decompression',
          'Slow breathing'
        ]
      }
    ],
    recoveryChecklist: [
      'Mobility + stretching',
      'Slow diaphragmatic breathing'
    ]
  },

  // 0 = SUNDAY
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
    walkingRange: '45 min',
    dayNote: 'No heavy lifting. And because you specifically said no home workouts, this is not a hidden home workout.',
    primaryAttributes: ['mobility', 'endurance', 'focus'],
    preparationSections: [],
    preparationChecklist: [
      'System rest: No heavy lifting or combat drills'
    ],
    exercises: [
      {
        id: 'mobility_flexibility_sun',
        name: 'Mobility + Flexibility (30 Min)',
        targetSets: 1,
        targetRepOrDuration: '30 min',
        metricType: 'CHECK_ONLY',
        category: 'recovery',
        notes: 'Keep intensity low. Full-body joint freedom & tissue restoration.'
      },
      {
        id: 'recovery_stretching_sun',
        name: 'Recovery Stretching + Breathing (15 Min)',
        targetSets: 1,
        targetRepOrDuration: '15 min',
        metricType: 'CHECK_ONLY',
        category: 'recovery',
        notes: 'Gentle passive stretching & slow parasympathetic breathing.'
      },
      {
        id: 'recovery_walk_sun',
        name: 'Outdoor Recovery Walk (45 Min)',
        targetSets: 1,
        targetRepOrDuration: '45 min',
        metricType: 'TIME_BLOCK',
        category: 'recovery',
        notes: 'Continuous 45 min walk in open air.'
      }
    ],
    recoverySections: [
      {
        title: 'Recovery Protocol',
        duration: '45 min',
        items: [
          '30 min mobility + flexibility (keep intensity low)',
          '15 min recovery stretching + breathing',
          '45 min continuous outdoor recovery walk'
        ]
      }
    ],
    recoveryChecklist: [
      '30 min low-intensity mobility + flexibility',
      '15 min recovery stretching + breathing',
      '45 min continuous outdoor recovery walk'
    ]
  }
};
