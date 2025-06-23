
import type { Lesson } from './ftc-java-lessons';
import { LessonContentType } from './ftc-java-lessons';

export const ftcJavaLessonsAdvanced: Lesson[] = [
  {
    id: 'advanced-lesson1',
    type: 'lesson',
    title: '1. Feedforward Control (The "F" in PIDF)',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Beyond Reactive Control',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'PID is a powerful **reactive** control system—it reacts to error. However, it always has to "see" an error before it can correct it. For dynamic systems like a drivetrain or a fast-moving arm, we can do better by being **proactive**. This is the role of **Feedforward** control.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Feedforward uses a physical model of your system to predict the amount of power needed to achieve a desired state, even before any error occurs. PID is then left with the much easier job of correcting for small, unpredictable disturbances.',
      },
      {
        type: LessonContentType.Heading,
        text: 'The Core Feedforward Terms',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>`kS` (Static Gain):</b> The minimum power needed to overcome static friction and get the mechanism moving at all. Think of it as the "push" needed to un-stick something.',
          '<b>`kV` (Velocity Gain):</b> The power needed to sustain a given velocity against forces like friction that increase with speed. It answers: "How much power do I need to keep moving at X speed?"',
          '<b>`kA` (Acceleration Gain):</b> The power needed to create a desired acceleration, based on the system\'s mass/inertia. It answers: "How much extra power do I need to speed up by Y amount?"',
          '<b>`kG` (Gravity Gain):</b> For vertical mechanisms like lifts, this is the power needed to simply hold the mechanism in place against gravity.',
        ],
      },
      {
        type: LessonContentType.Code,
        code: `// The theoretical feedforward calculation
// Power_ff = (kV * target_velocity) + (kA * target_acceleration) + kS + kG;
// Total_Power = Power_ff + Power_pid;

// In Road Runner, these values are found automatically for your drivetrain
// by the FeedforwardTuner OpMode and stored in DriveConstants.java
public static double kV = 1.0 / rpmToVelocity(MAX_RPM);
public static double kA = 0;
public static double kStatic = 0;
`
      },
       {
        type: LessonContentType.Paragraph,
        text: 'You don\'t need to implement this math yourself for your drivetrain. The key takeaway is understanding *why* Road Runner needs these constants. A well-tuned feedforward model allows Road Runner to be incredibly accurate, as it already knows how much power to send the motors to follow the path, using PID only for minor adjustments.'
       }
    ],
    quiz: [
        {
            question: 'What is the primary difference between Feedforward and PID control?',
            options: [
                'PID is for motors, Feedforward is for servos.',
                'Feedforward is proactive (predicts power), while PID is reactive (corrects error).',
                'Feedforward is simpler to tune than PID.',
                'They are two names for the same algorithm.'
            ],
            correctAnswer: 'Feedforward is proactive (predicts power), while PID is reactive (corrects error).',
            explanation: 'Feedforward uses a model to predict the necessary power for a desired motion, while PID corrects for errors between the desired and actual state. They work best when used together.'
        },
        {
            question: 'Which feedforward term accounts for the minimum power needed to overcome friction and get a motor to start moving?',
            options: [
                '`kS` (Static Gain)',
                '`kV` (Velocity Gain)',
                '`kA` (Acceleration Gain)',
                '`kG` (Gravity Gain)'
            ],
            correctAnswer: '`kS` (Static Gain)',
            explanation: '`kS`, or static gain, represents the power needed to overcome static friction, which is the initial "stickiness" of a system at rest.'
        },
        {
            question: 'If a vertically-mounted arm sags under its own weight, which feedforward term is specifically designed to counteract this?',
            options: [
                '`kP`',
                '`kA`',
                '`kV`',
                '`kG` (Gravity Gain)'
            ],
            correctAnswer: '`kG` (Gravity Gain)',
            explanation: '`kG` provides a constant power output to exactly balance the force of gravity, allowing the PID controller to work on a "gravity-neutral" system.'
        }
    ]
  },
  {
    id: 'advanced-lesson2',
    type: 'lesson',
    title: '2. Advanced Trajectory Constraints',
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
                'To define the robot\'s starting position.',
                'To limit the robot\'s maximum speed for a path segment.',
                'To make the entire path faster.'
            ],
            correctAnswer: 'To limit the robot\'s maximum speed for a path segment.',
            explanation: 'Constraints allow you to override the default maximum velocity and acceleration, giving you fine-grained control over the robot\'s speed at different points in its path.'
        },
        {
            question: 'In the example, after the first `splineTo` with custom constraints, what constraints will the second `splineTo` use?',
            options: [
                'No constraints, it will go as fast as possible.',
                'The same custom slow constraints.',
                'It will cause a compiler error.',
                'The default constraints from `DriveConstants.java`.'
            ],
            correctAnswer: 'The default constraints from `DriveConstants.java`.',
            explanation: 'Trajectory constraints in the builder are applied only to the specific path segment they are passed to. Subsequent segments revert to the default constraints unless specified otherwise.'
        },
        {
            question: 'Why would you use an `AngularVelocityConstraint`?',
            options: [
                'To make the robot drive straighter.',
                'To limit the speed of the wheels.',
                'To increase the robot\'s acceleration.',
                'To control the turning speed during a curved `splineTo` movement.'
            ],
            correctAnswer: 'To control the turning speed during a curved `splineTo` movement.',
            explanation: 'During a spline, the robot is both translating and rotating. An angular velocity constraint specifically limits the rotational component of this motion, which is useful for keeping the robot stable.'
        }
    ]
  },
  {
    id: 'advanced-lesson3',
    type: 'lesson',
    title: '3. Asynchronous Control',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'True Parallelism',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'So far, `drive.followTrajectorySequence()` has been a **blocking** call. The OpMode code stops and waits for the entire sequence to finish. This is simple, but inefficient. A high-level autonomous needs to perform actions *while* driving (e.g., raise a lift while moving towards the backdrop). This requires asynchronous control.'
      },
      {
        type: LessonContentType.Paragraph,
        text: 'By using `drive.followTrajectorySequenceAsync()`, you tell Road Runner to start the path but immediately return control to your OpMode loop. You can then use this loop to update other subsystems, like your lift, intake, and vision, all while Road Runner handles the driving in the background.'
      },
      {
        type: LessonContentType.Code,
        code: `// Assume a Lift subsystem class exists with a .update() method
Lift lift = new Lift(hardwareMap);

// Build the sequence as usual
TrajectorySequence sequence = drive.trajectorySequenceBuilder(startPose)
    .splineTo(new Vector2d(48, -36), 0)
    .build();

// In runOpMode:
waitForStart();
if (!opModeIsActive()) return;

// Start the sequence but DON'T wait for it to finish
drive.followTrajectorySequenceAsync(sequence);

// This is now our main autonomous loop
while (opModeIsActive() && drive.isBusy()) {
    // Tell Road Runner to update its motors
    drive.update();

    // Tell our lift to update its state machine
    lift.update();

    // We can even check the drive's current position to trigger actions
    Pose2d currentPose = drive.getPoseEstimate();
    if (currentPose.getX() > 24) {
        lift.setTargetPosition(LIFT_HIGH);
    }
    
    telemetry.update(); // Update telemetry
}`
      },
       {
        type: LessonContentType.Paragraph,
        text: 'The key is the `while (opModeIsActive() && drive.isBusy())` loop. This loop continues as long as Road Runner is actively following its path. Inside, you are responsible for calling `drive.update()` to send power to the motors, but you can *also* call `update()` on all your other subsystems, achieving true parallel execution.'
       }
    ],
    quiz: [
        {
            question: 'What is the main difference between `followTrajectorySequence` and `followTrajectorySequenceAsync`?',
            options: [
                '`Async` is less accurate.',
                '`Async` starts the path and immediately returns control to your code.',
                '`Async` is blocking; the regular one is not.',
                'There is no difference.'
            ],
            correctAnswer: '`Async` starts the path and immediately returns control to your code.',
            explanation: 'The `Async` version is non-blocking, which is the key to running other mechanisms in parallel with your drivetrain\'s movement.'
        },
        {
            question: 'When using the asynchronous approach, what crucial method must you call inside your `while` loop?',
            options: [
                '`drive.stop()`',
                '`drive.getPoseEstimate()`',
                '`drive.update()`',
                '`drive.waitForIdle()`'
            ],
            correctAnswer: '`drive.update()`',
            explanation: '`followTrajectorySequenceAsync` only *plans* the path. You must repeatedly call `drive.update()` in your loop to actually calculate and send power commands to the motors.'
        },
        {
            question: 'How do you know when an asynchronous trajectory has finished?',
            options: [
                'The `drive.isBusy()` method returns `false`.',
                'The OpMode stops automatically.',
                'You have to guess.',
                'An exception is thrown.'
            ],
            correctAnswer: 'The `drive.isBusy()` method returns `false`.',
            explanation: '`drive.isBusy()` is the flag that indicates Road Runner is still following a path. A `while(drive.isBusy())` loop is the standard way to wait for completion while updating other systems.'
        }
    ]
  },
  {
    id: 'advanced-lesson4',
    type: 'lesson',
    title: '4. Vision-Based Pose Correction',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'The Problem of Drift',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Even with perfectly tuned three-wheel odometry, small amounts of error will accumulate over time due to wheel slip, imperfections on the field floor, and frame flex. Over a 30-second autonomous, this "drift" can be several inches, causing you to miss scoring locations. The solution is to use an absolute positioning system, like AprilTags, to periodically correct your odometry.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'By detecting an AprilTag, whose position on the field is known, the robot can calculate its own absolute position on the field. It can then compare this "real" position to its internal odometry estimate and correct the difference.'
      },
      {
        type: LessonContentType.Heading,
        text: 'Implementing Correction',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'This is an advanced topic that requires careful math involving `Pose2d` transformations. However, many teams have created helper classes to simplify this. The core logic involves getting a detection, calculating the robot\'s pose from it, and then feeding that back into Road Runner.',
      },
      {
        type: LessonContentType.Code,
        code: `// Inside your autonomous loop, when you are near tags...
List<AprilTagDetection> detections = aprilTagProcessor.getDetections();

if (!detections.isEmpty()) {
    // Assuming you have a helper function to get an average pose from multiple tags
    Pose2d absolutePoseFromVision = getRobotPoseFromTags(detections);
    
    if (absolutePoseFromVision != null) {
        // This is the magic line. It tells Road Runner:
        // "Ignore your current odometry estimate. You are ACTUALLY at this new pose."
        drive.setPoseEstimate(absolutePoseFromVision);
    }
}`
      },
       {
        type: LessonContentType.Paragraph,
        text: 'Calling `drive.setPoseEstimate()` tells Road Runner to throw away its current X, Y, and Heading values and adopt the new ones from your vision system. This instantly corrects for any accumulated drift. High-level teams often do this multiple times during an autonomous routine whenever they are near the backdrop or truss to maintain near-perfect accuracy.'
       }
    ],
    quiz: [
        {
            question: 'What is "odometry drift"?',
            options: [
                'When the robot drives sideways.',
                'A feature of Road Runner to make paths smoother.',
                'When the IMU gives an incorrect angle.',
                'The gradual accumulation of small errors in the robot\'s position estimate.'
            ],
            correctAnswer: 'The gradual accumulation of small errors in the robot\'s position estimate.',
            explanation: 'Drift is inevitable in any system that relies on integrating sensor data (like encoders) over time. Small errors add up, causing the robot\'s belief of where it is to differ from reality.'
        },
        {
            question: 'How do AprilTags help solve the problem of odometry drift?',
            options: [
                'They are heavier, which makes the robot more stable.',
                'They tell the robot how fast it is going.',
                'They can be used to push pixels.',
                'They provide an absolute position reference to correct the odometry.'
            ],
            correctAnswer: 'They provide an absolute position reference to correct the odometry.',
            explanation: 'Because the AprilTags have fixed, known positions on the field, detecting one allows the robot to calculate its own absolute position, providing a "ground truth" to reset any accumulated odometry error.'
        },
        {
            question: 'Which Road Runner method is used to update the robot\'s internal position estimate with a new one from a vision system?',
            options: [
                '`drive.update()`',
                '`drive.getPoseEstimate()`',
                '`drive.followTrajectory()`',
                '`drive.setPoseEstimate(newPose)`'
            ],
            correctAnswer: '`drive.setPoseEstimate(newPose)`',
            explanation: '`setPoseEstimate` is the specific command to overwrite Road Runner\'s current belief about its position with a new, more accurate value, typically derived from an absolute sensor like a camera seeing an AprilTag.'
        }
    ]
  },
  {
    id: 'advanced-lesson5',
    type: 'lesson',
    title: '5. Intro to Command-Based Programming',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'A More Advanced Architecture',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'State machines in your OpMode are good, but as your robot logic gets more complex, they can become unwieldy "mega-files". A more scalable and professional architecture is **Command-Based Programming**. This pattern, popular in FRC and industrial robotics, decouples the *what* from the *how*.',
      },
      {
        type: LessonContentType.Heading,
        text: 'The Core Components',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>Subsystem:</b> A class representing a single part of the robot (e.g., `LiftSubsystem`, `IntakeSubsystem`). It holds the hardware objects and basic methods to control them (e.g., `setPower()`, `getPosition()`). It should **not** contain complex logic.',
          '<b>Command:</b> A class representing a single action or goal. It knows which subsystem(s) it needs. It has methods like `initialize()`, `execute()`, `isFinished()`, and `end()`. For example, a `GoToLiftPositionCommand` would use the `LiftSubsystem`.',
          '<b>Scheduler:</b> A central "manager" that runs in your main OpMode loop. You tell the scheduler to run a command (e.g., when a button is pressed). The scheduler then calls the command\'s `execute()` method repeatedly until `isFinished()` returns true, at which point it calls `end()` and stops running it.',
        ]
      },
       {
        type: LessonContentType.Paragraph,
        text: 'While the FTC SDK does not have a built-in scheduler like FRC, the principles are powerful. The community library **FTCLib** provides a full command-based framework. The key benefit is **reusability and decoupling**. You can create complex sequences of commands (drive and intake, then raise lift, etc.) without putting any of that complex logic inside the subsystem or the OpMode. Your OpMode just maps buttons to commands.'
       },
       {
        type: LessonContentType.Code,
        code: `// --- OpMode using FTCLib ---
public class MyCommandBasedTeleOp extends CommandOpMode {
    // Subsystems
    private LiftSubsystem lift;
    private DrivetrainSubsystem drivetrain;

    // Commands
    private GoToLiftPositionCommand liftHigh;
    private GoToLiftPositionCommand liftLow;
    private DefaultDriveCommand driveCommand;

    @Override
    public void initialize() {
        // Initialize subsystems and commands...
        lift = new LiftSubsystem(hardwareMap);
        drivetrain = new DrivetrainSubsystem(hardwareMap);
        
        liftHigh = new GoToLiftPositionCommand(lift, LIFT_HIGH);
        liftLow = new GoToLiftPositionCommand(lift, LIFT_LOW);
        driveCommand = new DefaultDriveCommand(drivetrain, gamepad1);
        
        // Map buttons to commands
        new GamepadButton(gamepadEx1, GamepadKeys.Button.Y).whenActive(liftHigh);
        new GamepadButton(gamepadEx1, GamepadKeys.Button.A).whenActive(liftLow);
        
        register(lift, drivetrain);
        drivetrain.setDefaultCommand(driveCommand);
    }
}`
       },
       {
        type: LessonContentType.Paragraph,
        text: 'Notice how clean the OpMode is. All the complex logic for moving the lift to a position is contained within the `GoToLiftPositionCommand`, and the OpMode simply "schedules" that command when a button is pressed.'
       }
    ],
    quiz: [
        {
            question: 'In Command-Based programming, what is the primary responsibility of a `Subsystem`?',
            options: [
                'To represent a physical part of the robot and expose basic control methods.',
                'To read inputs from the gamepad.',
                'To contain the complex sequence of actions for autonomous.',
                'To schedule which actions run and when.'
            ],
            correctAnswer: 'To represent a physical part of the robot and expose basic control methods.',
            explanation: 'A Subsystem should be "dumb." It knows how to turn its motor on and off, but it shouldn\'t know *why* or for how long. That complex logic belongs in a Command.'
        },
        {
            question: 'What is the role of the `Scheduler` in a command-based framework?',
            options: [
                'To manage the lifecycle of commands, running them until they are finished.',
                'To hold all the hardware device objects.',
                'To replace the need for an OpMode.',
                'To define the robot\'s physical constants.'
            ],
            correctAnswer: 'To manage the lifecycle of commands, running them until they are finished.',
            explanation: 'The Scheduler is the central manager that runs in the main loop, calling the execute() method of all scheduled commands and handling their completion.'
        },
        {
            question: 'What is a major advantage of Command-Based architecture over a large state machine in the OpMode?',
            options: [
                'It uses less memory.',
                'It runs faster on the Robot Controller.',
                'It makes code more reusable, modular, and easier to test.',
                'It is simpler for a beginner to write from scratch.'
            ],
            correctAnswer: 'It makes code more reusable, modular, and easier to test.',
            explanation: 'By separating subsystems from commands, you can easily reuse a command in both autonomous and TeleOp. This decoupling makes the code much cleaner and easier to manage as complexity grows.'
        }
    ]
  },
  {
    id: 'advanced-final-test',
    type: 'test',
    title: 'Advanced Final Test',
    isFinalTestForCourse: true,
    passingScore: 8,
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Advanced Course Final Test',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'This test covers the advanced lessons. You must score at least 8 out of 10 to pass. Good luck!',
      }
    ],
    quiz: [
      {
        question: "In Road Runner, what is the purpose of Feedforward gains like `kV` and `kA`?",
        options: [
          "To correct for errors after they have occurred.",
          "To proactively predict the motor power needed for a given velocity and acceleration.",
          "To limit the robot's maximum speed.",
          "To define the physical size of the robot."
        ],
        correctAnswer: "To proactively predict the motor power needed for a given velocity and acceleration.",
        explanation: "Feedforward is proactive, using a model of the robot to predict required power, which makes the system much more responsive than a purely reactive PID controller."
      },
      {
        question: "You need your robot to drive very slowly while passing under a bridge, but quickly across the rest of the field. What is the best way to achieve this?",
        options: [
          "Lower the max speed for the entire OpMode.",
          "Apply custom `TrajectoryVelocityConstraint` and `TrajectoryAccelerationConstraint` to that specific path segment.",
          "Use `sleep()` commands to slow it down.",
          "Manually control the motor power."
        ],
        correctAnswer: "Apply custom `TrajectoryVelocityConstraint` and `TrajectoryAccelerationConstraint` to that specific path segment.",
        explanation: "Constraints allow for fine-grained, segment-by-segment control of your path's motion profile, which is the ideal way to handle this."
      },
      {
        question: "What is the key difference between `drive.followTrajectorySequence()` and `drive.followTrajectorySequenceAsync()`?",
        options: [
          "The `Async` version is less accurate.",
          "The `Async` version is non-blocking, allowing other code to run in parallel.",
          "The `Async` version does not require tuning.",
          "The regular version is for TeleOp, `Async` is for Auto."
        ],
        correctAnswer: "The `Async` version is non-blocking, allowing other code to run in parallel.",
        explanation: "Asynchronous following is critical for advanced autonomous routines where mechanisms must operate at the same time as the drivetrain."
      },
      {
        question: "Your robot's odometry shows it is at X=50, but after detecting an AprilTag, you calculate its true position is X=55. What is this discrepancy called and how do you fix it in Road Runner?",
        options: [
          "It's called a bug; you must restart the OpMode.",
          "It's called lag; you fix it by calling `drive.update()` more often.",
          "It's called a constraint violation; you fix it by increasing `MAX_VEL`.",
          "It's called odometry drift; you fix it with `drive.setPoseEstimate()`."
        ],
        correctAnswer: "It's called odometry drift; you fix it with `drive.setPoseEstimate()`.",
        explanation: "Odometry drift is the inevitable accumulation of small errors. Using an absolute reference like an AprilTag and calling `setPoseEstimate()` is the standard way to correct it."
      },
      {
        question: "In the Command-Based programming paradigm, what is the primary role of a `Command`?",
        options: [
          "To define a specific, self-contained action with a clear end condition.",
          "To hold the `DcMotor` and `Servo` objects.",
          "To manage the main OpMode loop.",
          "To store hardware configuration names."
        ],
        correctAnswer: "To define a specific, self-contained action with a clear end condition.",
        explanation: "A Command encapsulates a single goal, like 'GoToLiftPosition'. It uses Subsystems to achieve this goal and tells the Scheduler when it's finished."
      },
      {
        question: "Which feedforward term specifically counteracts the force of gravity on a vertical lift?",
        options: [
            "`kS` (Static Gain)",
            "`kG` (Gravity Gain)",
            "`kV` (Velocity Gain)",
            "`kA` (Acceleration Gain)"
        ],
        correctAnswer: "`kG` (Gravity Gain)",
        explanation: "`kG` provides a constant power output to perfectly balance the force of gravity, making the mechanism behave as if it were on a horizontal plane."
      },
      {
          question: "When following a trajectory asynchronously, your main autonomous loop should continue as long as `opModeIsActive()` is true AND what other condition is true?",
          options: [
              "`drive.isFinished()`",
              "`drive.isBusy()`",
              "`drive.hasError()`",
              "`drive.trajectoryCompleted()`"
          ],
          correctAnswer: "`drive.isBusy()`",
          explanation: "`drive.isBusy()` returns true while Road Runner is actively following a trajectory, making it the perfect condition for your main autonomous loop."
      },
      {
          question: "In Command-Based architecture, what is the advantage of decoupling `Subsystems` from `Commands`?",
          options: [
              "It improves reusability; the same Command can be triggered by a button in TeleOp or run in an autonomous sequence.",
              "It makes the code run faster.",
              "It's the only way to use the IMU.",
              "It uses less battery power."
          ],
          correctAnswer: "It improves reusability; the same Command can be triggered by a button in TeleOp or run in an autonomous sequence.",
          explanation: "Decoupling allows you to write the logic for an action once (in a Command) and then use it in multiple contexts, which is a core principle of good software design."
      },
      {
          question: "Why can't you just rely on odometry for a full 30-second autonomous without any correction?",
          options: [
              "The odometry wheels will break.",
              "Small, incremental errors from wheel slip will accumulate into a large position error.",
              "The rules forbid it.",
              "The IMU will overheat."
          ],
          correctAnswer: "Small, incremental errors from wheel slip will accumulate into a large position error.",
          explanation: "No physical system is perfect. Odometry drift is unavoidable, and using an absolute reference like AprilTags is the best way to ensure field-long accuracy."
      },
      {
          question: "If you want to run your intake motor while your robot is driving a 5-second trajectory, what is the best approach?",
          options: [
              "Drive the trajectory, then run the intake for 5 seconds.",
              "Create a single trajectory that has the intake command embedded in it.",
              "It is not possible to do both at once.",
              "Use `followTrajectorySequenceAsync()` and control the intake from within the main `while(drive.isBusy())` loop."
          ],
          correctAnswer: "Use `followTrajectorySequenceAsync()` and control the intake from within the main `while(drive.isBusy())` loop.",
          explanation: "This is the classic use case for asynchronous control. Starting the trajectory asynchronously allows your main loop to be free to run other logic, like controlling an intake motor, in parallel."
      }
    ]
  }
];
