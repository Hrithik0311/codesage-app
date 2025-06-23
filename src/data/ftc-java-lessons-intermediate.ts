
import type { Lesson } from './ftc-java-lessons';
import { LessonContentType } from './ftc-java-lessons';

export const ftcJavaLessonsIntermediate: Lesson[] = [
  {
    id: 'intermediate-lesson1',
    type: 'lesson',
    title: 'Intro to Road Runner',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'What is Road Runner?',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Road Runner is the most powerful and popular motion planning library available for FTC. Instead of writing separate commands for "drive" and "turn", Road Runner allows you to define complex, continuous paths (trajectories) that the robot follows with high precision. This enables faster, smoother, and more reliable autonomous routines.',
      },
      {
        type: LessonContentType.Heading,
        text: 'Core Components',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>Three-Wheel Odometry:</b> For hyper-accurate position tracking, Road Runner uses unpowered wheels with encoders to measure the robot\'s true X, Y, and heading position, independent of wheel slip from the main drivetrain.',
          '<b>Feedforward Control:</b> It goes beyond simple PID by using a "feedforward" model. It calculates the theoretical motor voltages needed to follow the path and then uses PID to correct for small errors.',
          '<b>Trajectory Generation:</b> You define paths using a simple API, and Road Runner generates smooth velocity and acceleration profiles to follow them optimally.',
        ]
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Successfully implementing Road Runner requires a mechanically sound robot (rigid frame, quality motors) and a dedicated tuning process. The official documentation at <a href="https://learnroadrunner.com" target="_blank" rel="noopener noreferrer" style="color:hsl(var(--accent));text-decoration:underline;">learnroadrunner.com</a> is your essential guide.',
      }
    ],
    quiz: [
      {
        question: 'What is the primary advantage of Road Runner over a simple state machine?',
        options: ['It is easier to program.', 'It allows for smooth, continuous path following instead of discrete drive/turn segments.', 'It uses less battery.', 'It does not require encoders.'],
        correctAnswer: 'It allows for smooth, continuous path following instead of discrete drive/turn segments.',
        explanation: 'Road Runner plans the entire motion profile, including acceleration and velocity, to create fast and smooth paths that are impossible with simple state-based commands.'
      },
      {
        question: 'What is "feedforward" control in the context of Road Runner?',
        options: ['A type of sensor.', 'A control method that proactively calculates the required motor power based on a model of the robot, rather than just reacting to error.', 'A way to send telemetry data forward to the next state.', 'Another name for PID control.'],
        correctAnswer: 'A control method that proactively calculates the required motor power based on a model of therobot, rather than just reacting to error.',
        explanation: 'Feedforward anticipates the power needed to execute a motion, making the controller much more responsive and accurate than a purely reactive PID controller.'
      }
    ]
  },
  {
    id: 'intermediate-lesson2',
    type: 'lesson',
    title: 'Tuning Odometry',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'The Foundation of Accuracy',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Accurate odometry is non-negotiable for Road Runner to work well. This involves a precise tuning process to find three key constants for your robot build.',
      },
      {
        type: LessonContentType.Code,
        code: `// These constants are found via the LearnRoadRunner.com tuning process
public static double TICKS_PER_REV = 8192; // From your encoder specs
public static double WHEEL_RADIUS = 0.688975; // In inches
public static double GEAR_RATIO = 1.0; // Your drivetrain gear ratio

// These are the values you TUNE
public static double LATERAL_DISTANCE = 15.5; // Distance between the two parallel odometry wheels
public static double FORWARD_OFFSET = 4.0; // Distance of perpendicular wheel from the center of the parallel wheels`
      },
      {
        type: LessonContentType.Paragraph,
        text: 'The tuning process involves running special OpModes that have you drive the robot a set distance or turn it a set angle. You then compare the robot\'s real-world movement to what the odometry *thinks* it did, and adjust the constants until they match perfectly. This process requires patience and precision.'
      }
    ],
    quiz: [
      {
        question: 'Why is odometry tuning so critical for Road Runner?',
        options: ['It makes the robot look cool.', 'Because if the robot\'s position tracking is wrong, its ability to follow a path will also be wrong.', 'It is an optional step.', 'It helps you choose motor power.'],
        correctAnswer: 'Because if the robot\'s position tracking is wrong, its ability to follow a path will also be wrong.',
        explanation: 'Road Runner\'s path following is a closed-loop system. It constantly compares its real-time odometry position to the desired position on the path. If the odometry is inaccurate, the "correction" will be wrong.'
      }
    ]
  },
  {
    id: 'intermediate-lesson3',
    type: 'lesson',
    title: 'Building Trajectories',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Defining Your Path',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Once your robot is tuned, you can start building autonomous paths using the `TrajectoryBuilder`. You start at a given pose (X, Y, Heading) and then chain commands together to define the path.'
      },
      {
        type: LessonContentType.Code,
        code: `// Create a TrajectoryBuilder starting at pose (0, 0) with a heading of 0 degrees
Trajectory myFirstTrajectory = drive.trajectoryBuilder(new Pose2d())
    .splineTo(new Vector2d(30, 30), Math.toRadians(90)) // Smoothly curve to (30,30) ending at 90 deg
    .strafeRight(10) // Strafe right 10 inches
    .build();

// In your autonomous OpMode, you simply run it:
drive.followTrajectory(myFirstTrajectory);
`
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Road Runner provides a rich set of commands like `forward()`, `back()`, `strafeLeft()`, `splineTo()` (for curves), and `lineTo()` (for straight lines) that let you build up almost any path imaginable. You can also add "markers" to these trajectories to trigger actions like opening a claw or raising a slide at specific points along the path.'
      }
    ],
    quiz: [
      {
        question: 'What is the difference between `lineTo()` and `splineTo()` in Road Runner?',
        options: ['`lineTo` is for turning and `splineTo` is for driving forward.', 'There is no difference.', '`lineTo` creates a straight-line path, while `splineTo` creates a smooth, curved path.', '`splineTo` is less accurate.'],
        correctAnswer: '`lineTo` creates a straight-line path, while `splineTo` creates a smooth, curved path.',
        explanation: 'Splines are the key to Road Runner\'s fluid motion, allowing the robot to drive and turn simultaneously to follow a curve, which is much more efficient than separate drive/turn commands.'
      }
    ]
  }
];
