
import type { Lesson } from './ftc-java-lessons';
import { LessonContentType } from './ftc-java-lessons';

export const ftcJavaLessonsAdvanced: Lesson[] = [
  {
    id: 'advanced-lesson1',
    type: 'lesson',
    title: '1. Advanced Trajectory Constraints',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Controlling Path Velocity & Acceleration',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'You\'ve learned how to build basic trajectories, but Road Runner offers much more control. By default, trajectories use global velocity and acceleration constraints defined in `DriveConstants.java`. However, you can override these for specific parts of a path. This is crucial for actions that require the robot to move slowly and precisely, like navigating under an obstacle or aligning to a scoring location.',
      },
      {
        type: LessonContentType.Code,
        code: `// You can define custom constraints
TrajectoryVelocityConstraint slowVelocityConstraint = new MinVelocityConstraint(Arrays.asList(
        new TranslationalVelocityConstraint(15), // Max 15 inches/sec
        new AngularVelocityConstraint(Math.toRadians(80)) // Max 80 deg/sec
));

TrajectoryAccelerationConstraint slowAccelerationConstraint = new ProfileAccelerationConstraint(15); // Max 15 in/sec^2

// Then apply them to a specific segment of your trajectory
TrajectorySequence mySequence = drive.trajectorySequenceBuilder(startPose)
    .forward(20)
    // Drive the next segment slowly and carefully
    .splineTo(new Vector2d(40, -10), 0, slowVelocityConstraint, slowAccelerationConstraint)
    // The rest of the trajectory will use the default constraints
    .splineTo(new Vector2d(60, 0), 0)
    .build();`
      },
       {
        type: LessonContentType.Paragraph,
        text: 'Using custom constraints allows you to build much more robust and reliable autonomous routines. You can have the robot move at maximum speed across the open field but then slow down for delicate, precise maneuvers.'
       }
    ],
    quiz: [
        {
            question: 'What is the purpose of a TrajectoryVelocityConstraint?',
            options: [
                'To make the robot heavier.',
                'To limit the maximum speed of the robot for a specific segment of a trajectory.',
                'To define the robot\'s starting position.',
                'To make the entire path faster.'
            ],
            correctAnswer: 'To limit the maximum speed of the robot for a specific segment of a trajectory.',
            explanation: 'Constraints allow you to override the default maximum velocity and acceleration, giving you fine-grained control over the robot\'s speed at different points in its path.'
        }
    ]
  }
];
