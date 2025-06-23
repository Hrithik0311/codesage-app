
import type { Lesson } from './ftc-java-lessons';
import { LessonContentType } from './ftc-java-lessons';

export const ftcJavaLessonsIntermediate: Lesson[] = [
  // LESSON 1: REVISED
  {
    id: 'intermediate-lesson1',
    type: 'lesson',
    title: '1. What is Road Runner?',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Beyond State Machines',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'You\'ve mastered state machines, which are great for sequential tasks. But what if you want to drive in a smooth curve while also raising a slide? This is where a motion planning library like **Road Runner** becomes essential. It is the most popular and powerful motion library available for FTC.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Instead of writing separate commands for "drive" and "turn", Road Runner allows you to define complex, continuous paths (trajectories) that the robot follows with high precision. This enables faster, smoother, and more reliable autonomous routines.',
      },
      {
        type: LessonContentType.Heading,
        text: 'Core Components',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>Pose2d:</b> A fundamental object in Road Runner representing the robot\'s position. It holds an X coordinate, a Y coordinate, and a Heading (angle). `new Pose2d(x, y, heading)`',
          '<b>Three-Wheel Odometry:</b> For hyper-accurate position tracking, Road Runner uses unpowered "dead wheels" with encoders to measure the robot\'s true `Pose2d`, independent of wheel slip from the main drivetrain.',
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
        options: ['It allows for smooth path following instead of discrete movements.', 'It is easier to program.', 'It uses less battery.', 'It does not require encoders.'],
        correctAnswer: 'It allows for smooth path following instead of discrete movements.',
        explanation: 'Road Runner plans the entire motion profile, including acceleration and velocity, to create fast and smooth paths that are impossible with simple state-based commands.'
      },
      {
        question: 'What does a `Pose2d` object represent in Road Runner?',
        options: ['The power settings for the motors.', 'A single point on the field with no orientation.', 'The robot\'s X position, Y position, and heading.', 'The time remaining in the match.'],
        correctAnswer: 'The robot\'s X position, Y position, and heading.',
        explanation: 'A `Pose2d` is the complete representation of the robot\'s location and orientation on the 2D field.'
      },
      {
        question: 'What is "feedforward" control in the context of Road Runner?',
        options: ['A proactive control method that anticipates required motor power.', 'A way to send telemetry data to the next state.', 'Another name for PID control.', 'A type of sensor.'],
        correctAnswer: 'A proactive control method that anticipates required motor power.',
        explanation: 'Feedforward anticipates the power needed to execute a motion, making the controller much more responsive and accurate than a purely reactive PID controller.'
      }
    ]
  },
  // LESSON 2: REVISED
  {
    id: 'intermediate-lesson2',
    type: 'lesson',
    title: '2. Road Runner Tuning: The Foundation',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'The Non-Negotiable Step',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Accurate position tracking is the absolute foundation of Road Runner. This is achieved through a precise tuning process to characterize your robot\'s physical and dynamic properties. The official LearnRoadRunner guide provides a sequence of special OpModes to find these values.',
      },
      {
        type: LessonContentType.Heading,
        text: 'Key Tuning OpModes',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>`DriveVelocityPIDTuner`</b>: This tunes the PIDF coefficients for your drivetrain motors to ensure they can accurately follow a velocity command.',
          '<b>`StrafeTest` & `TurnTest`</b>: These are manual tuning OpModes. You command the robot to strafe or turn a set amount, and then measure the actual distance/angle it moved. You adjust tracking wheel constants (`LATERAL_DISTANCE`, `FORWARD_OFFSET`) until the robot\'s reported position matches reality.',
          '<b>`LocalizationTest`</b>: This OpMode lets you drive the robot around and see its tracked position on the FTC Dashboard field visualizer to confirm everything is working correctly.',
          '<b>`FollowerPIDTuner`</b>: This tunes the final PIDs that correct the robot\'s path, ensuring it stays on the trajectory.',
        ]
      },
      {
        type: LessonContentType.Code,
        code: `// These constants are found via the LearnRoadRunner.com tuning process
// In DriveConstants.java
public static double TICKS_PER_REV = 8192; // From your encoder specs
public static double WHEEL_RADIUS = 0.688975; // In inches
public static double GEAR_RATIO = 1.0; // Your drivetrain gear ratio

// In StandardTrackingWheelLocalizer.java
public static double LATERAL_DISTANCE = 15.5; // Distance between parallel wheels
public static double FORWARD_OFFSET = 4.0; // Perpendicular wheel's offset`
      },
      {
        type: LessonContentType.Paragraph,
        text: 'This process requires patience and precision. Skipping or rushing a step will lead to poor performance. A well-tuned robot can be incredibly accurate, often to within a fraction of an inch over a full autonomous path.'
      }
    ],
    quiz: [
      {
        question: 'Why is odometry tuning so critical for Road Runner?',
        options: ['It is an optional step.', 'It helps you choose motor power.', 'Because inaccurate position tracking leads to inaccurate path following.', 'It makes the robot look cool.'],
        correctAnswer: 'Because inaccurate position tracking leads to inaccurate path following.',
        explanation: 'Road Runner\'s path following is a closed-loop system. It constantly compares its real-time odometry position to the desired position on the path. If the odometry is inaccurate, the "correction" will be wrong.'
      },
      {
        question: 'Which tuning OpMode is used to find the PIDF values for your drivetrain motors?',
        options: ['`LocalizationTest`', '`TurnTest`', '`DriveVelocityPIDTuner`', '`FollowerPIDTuner`'],
        correctAnswer: '`DriveVelocityPIDTuner`',
        explanation: 'The `DriveVelocityPIDTuner` is the crucial first step that ensures your motors can reliably achieve the velocities that Road Runner will command them to run at.'
      },
      {
        question: 'What is `LocalizationTest` used for?',
        options: ['To find the `LATERAL_DISTANCE` constant.', 'To visually confirm the robot\'s odometry tracking is correct.', 'To test the robot\'s maximum speed.', 'To tune the follower PIDs.'],
        correctAnswer: 'To visually confirm the robot\'s odometry tracking is correct.',
        explanation: '`LocalizationTest` is a final sanity check to ensure your odometry is working as expected before you move on to trajectory following.'
      }
    ]
  },
  // LESSON 3: REVISED
  {
    id: 'intermediate-lesson3',
    type: 'lesson',
    title: '3. Building Trajectories',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Defining Your Path',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Once your robot is tuned, you can build autonomous paths. A single, continuous path is called a **Trajectory**. A sequence of multiple trajectories and other actions (like turns) is called a **Trajectory Sequence**. Most autonomous routines will be a single `TrajectorySequence`.'
      },
      {
        type: LessonContentType.Code,
        code: `// In your autonomous OpMode...
// Create a TrajectorySequenceBuilder starting at pose (0, 0)
TrajectorySequence mySequence = drive.trajectorySequenceBuilder(new Pose2d(0, 0, 0))
    .forward(30)
    .turn(Math.toRadians(90))
    .splineTo(new Vector2d(40, -20), Math.toRadians(0))
    .strafeRight(10)
    .build();

// In your runOpMode, you simply run the whole sequence:
waitForStart();
if (opModeIsActive()) {
    drive.followTrajectorySequence(mySequence);
}`
      },
      {
        type: LessonContentType.Heading,
        text: 'Common Trajectory Commands',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>`.forward(distance)`</b>: Drives straight forward.',
          '<b>`.back(distance)`</b>: Drives straight backward.',
          '<b>`.strafeLeft(distance)` / `.strafeRight(distance)`</b>: Strafes sideways.',
          '<b>`.turn(angle)`</b>: Performs an in-place turn.',
          '<b>`.lineTo(Vector2d)`</b>: Moves in a straight line to a new X,Y coordinate.',
          '<b>`.splineTo(Vector2d, endTangent)`</b>: Moves in a smooth curve to a new X,Y coordinate, approaching it from the `endTangent` angle.',
        ]
      }
    ],
    quiz: [
      {
        question: 'What is the difference between a `Trajectory` and a `TrajectorySequence`?',
        options: ['They are the same thing.', 'A `Trajectory` is one path; a `TrajectorySequence` is a series of paths.', 'A `Trajectory` is for turning, a `Sequence` is for driving.', 'A `TrajectorySequence` is less accurate.'],
        correctAnswer: 'A `Trajectory` is one path; a `TrajectorySequence` is a series of paths.',
        explanation: 'For a full autonomous path, you\'ll typically use a `trajectorySequenceBuilder` to chain multiple movements and actions together.'
      },
      {
        question: 'What is the difference between `lineTo()` and `splineTo()`?',
        options: ['`lineTo` is for turning and `splineTo` is for driving forward.', '`splineTo` is less accurate.', 'There is no difference.', '`lineTo` creates a straight-line path, while `splineTo` creates a smooth, curved path.'],
        correctAnswer: '`lineTo` creates a straight-line path, while `splineTo` creates a smooth, curved path.',
        explanation: 'Splines are the key to Road Runner\'s fluid motion, allowing the robot to drive and turn simultaneously to follow a curve, which is much more efficient than separate drive/turn commands.'
      },
      {
        question: 'If you build a sequence with `.forward(24).turn(Math.toRadians(90))`, what will the robot do?',
        options: ['Drive forward while turning.', 'Turn first, then drive forward.', 'It will throw an error.', 'Drive forward 24 inches, stop, then turn 90 degrees in place.'],
        correctAnswer: 'Drive forward 24 inches, stop, then turn 90 degrees in place.',
        explanation: 'The `trajectorySequenceBuilder` executes each command sequentially. The robot completes the `.forward()` action before beginning the `.turn()` action.'
      }
    ]
  },
  // LESSON 4: NEW
  {
    id: 'intermediate-lesson4',
    type: 'lesson',
    title: '4. Advanced Trajectories & Markers',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Actions During a Path',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Driving is only half the battle. You need to run intakes, lift slides, and drop pixels *during* your autonomous path. Road Runner handles this with **Markers**. A marker lets you trigger your own code at a specific point in the trajectory.'
      },
      {
        type: LessonContentType.Heading,
        text: 'Types of Markers',
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>Temporal Markers:</b> Triggered after a certain amount of time has passed. Example: `.addTemporalMarker(2.5, () -> { /* code here */ })` fires 2.5 seconds into the trajectory.',
          '<b>Displacement Markers:</b> Triggered after the robot has traveled a certain distance along the path. Example: `.addDisplacementMarker(12, () -> { /* code here */ })` fires after 12 inches of movement.',
          '<b>Spatial Markers:</b> Triggered when the robot\'s wheels cross a specific X or Y coordinate. Example: `.splineTo(..., TrajectoryBuilder.strafeLeft(10).addSpatialMarker(new Vector2d(20, -10), () -> { ... }))`',
        ]
      },
      {
        type: LessonContentType.Code,
        code: `// Example of using a marker to drop a pixel
TrajectorySequence mySequence = drive.trajectorySequenceBuilder(startPose)
    .forward(20)
    // After driving 20 inches, start raising the slide.
    // This action runs in parallel with the next driving segment.
    .addDisplacementMarker(() -> {
        robot.lift.setTargetPosition(LIFT_HIGH);
    })
    .splineTo(new Vector2d(48, -36), 0)
    // When the spline is finished, drop the pixel.
    .addTemporalMarker(() -> {
        robot.claw.open();
    })
    // Add a 0.5 second delay to ensure the pixel has dropped
    .waitSeconds(0.5)
    .back(10)
    .build();
`
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Note the use of `() -> { ... }`. This is a Java Lambda expression. It\'s a concise way to pass a small block of code as an argument to a method. Your marker code **must be non-blocking**. This means it should only set a target or change a state, not contain a `while` loop or a `sleep()`!'
      }
    ],
    quiz: [
      {
        question: 'What is the purpose of a marker in Road Runner?',
        options: ['To trigger custom code at a specific point in a path.', 'To mark a spot on the field with a physical object.', 'To pause the trajectory for a few seconds.', 'To add comments to your code.'],
        correctAnswer: 'To trigger custom code at a specific point in a path.',
        explanation: 'Markers are the bridge between Road Runner\'s path following and your robot\'s other subsystems, allowing you to schedule actions.'
      },
      {
        question: 'Your marker code, like `() -> { robot.lift.setTargetPosition(1000); }`, must be:',
        options: ['Very long and complex.', 'Non-blocking (it should not wait for the action to finish).', 'Contained within a `while` loop.', 'Able to pause the robot for several seconds.'],
        correctAnswer: 'Non-blocking (it should not wait for the action to finish).',
        explanation: 'Road Runner updates its drive commands very frequently. Any blocking code (like a `sleep()` or a loop) inside a marker will disrupt the path following and cause jerky, inaccurate movement.'
      },
      {
        question: 'Which type of marker would you use to trigger an action exactly 15 inches into a 30-inch forward drive?',
        options: ['Displacement Marker', 'Temporal Marker', 'Spatial Marker', 'Coordinate Marker'],
        correctAnswer: 'Displacement Marker',
        explanation: 'A displacement marker is triggered based on the distance traveled along the path, making it perfect for actions that need to happen partway through a movement.'
      }
    ]
  },
  // LESSON 5: NEW
  {
    id: 'intermediate-lesson5',
    type: 'lesson',
    title: '5. Vision Pipelines & Control',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Beyond Default Vision',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'The FTC VisionPortal is powerful because it\'s a flexible pipeline. You can have multiple processors (like AprilTag and TensorFlow) attached to the same camera, and you can control them dynamically to optimize performance.'
      },
      {
        type: LessonContentType.Heading,
        text: 'Managing Processors',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Running vision processing, especially TFOD, uses a lot of CPU power. If you only need to detect a Team Prop at the beginning of autonomous, it\'s wasteful to keep the TFOD processor running for the whole match. You can disable and enable processors on the fly.'
      },
      {
        type: LessonContentType.Code,
        code: `// During initialization, both are added but we can set the state.
visionPortal = new VisionPortal.Builder()
    .setCamera(webcam)
    .addProcessors(tfod, aprilTag)
    .build();

// To find the prop at the start of auto, TFOD is enabled
visionPortal.setProcessorEnabled(tfod, true);
visionPortal.setProcessorEnabled(aprilTag, false);

// ... loop to find the prop using TFOD ...
// Once we've found it and are done with TFOD:
visionPortal.setProcessorEnabled(tfod, false);

// Now, enable the AprilTag processor for localization during the rest of auto
visionPortal.setProcessorEnabled(aprilTag, true);

// ... rest of autonomous using AprilTag data ...
`
      },
      {
        type: LessonContentType.Heading,
        text: 'Camera Controls',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'You can also access and change camera settings like exposure and gain. This can be crucial for reliable vision in different lighting conditions. For example, if you are looking for a bright AprilTag, you can lower the exposure to prevent the white parts from getting "blown out" and unreadable.'
      },
      {
        type: LessonContentType.Code,
        code: `// This requires waiting for the camera to be streaming
while (visionPortal.getCameraState() != VisionPortal.CameraState.STREAMING) {
    // wait for camera to start
}

// Get the gain control
GainControl gainControl = visionPortal.getCameraControl(GainControl.class);
gainControl.setGain(gainControl.getMaxGain()); // Set to max gain for low light

// Get the exposure control
ExposureControl exposureControl = visionPortal.getCameraControl(ExposureControl.class);
exposureControl.setMode(ExposureControl.Mode.Manual);
exposureControl.setExposure(15, TimeUnit.MILLISECONDS); // Set to 15ms exposure
`
      }
    ],
    quiz: [
      {
        question: 'Why might you want to disable a vision processor like TFOD after you are done with it?',
        options: ['To make the camera turn off.', 'The rules require it.', 'To prevent it from detecting objects again.', 'To save CPU power and improve robot performance.'],
        correctAnswer: 'To save CPU power and improve robot performance.',
        explanation: 'Vision processing is computationally expensive. Disabling processors you aren\'t using frees up the CPU to focus on other tasks, like running motors and calculating Road Runner paths.'
      },
      {
        question: 'When would be a good time to manually lower a camera\'s exposure setting?',
        options: ['When the room is very dark.', 'To prevent bright objects like AprilTags from being overexposed.', 'When you want a blurrier image.', 'It should always be set to auto.'],
        correctAnswer: 'To prevent bright objects like AprilTags from being overexposed.',
        explanation: 'A blown-out, pure white image contains no data. Lowering the exposure can preserve the details of the black and white squares on an AprilTag, making it easier for the processor to detect.'
      },
      {
        question: 'Can you have an AprilTagProcessor and a TfodProcessor active at the same time on one VisionPortal?',
        options: ['Yes, the VisionPortal is designed to handle multiple processors in a pipeline.', 'No, only one processor is allowed per camera.', 'Yes, but it is not recommended.', 'Only if you have two cameras.'],
        correctAnswer: 'Yes, the VisionPortal is designed to handle multiple processors in a pipeline.',
        explanation: 'The VisionPortal can manage multiple processors, and you can get detections from all enabled processors in your loop. However, you should consider the performance impact of running them simultaneously.'
      }
    ]
  },
  // LESSON 6: NEW
  {
    id: 'intermediate-lesson6',
    type: 'lesson',
    title: '6. Asynchronous Control',
    content: [
      {
        type: LessonContentType.Heading,
        text: 'The Problem with `sleep()`',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'A common beginner mistake is using `sleep()` or `while(motor.isBusy())` inside the main TeleOp loop. This is **blocking code**. It freezes your entire program, including reading gamepad inputs, while it waits. This leads to unresponsive, clunky controls. The solution is **asynchronous control** using state machines for your subsystems.'
      },
      {
        type: LessonContentType.Heading,
        text: 'Subsystem State Machines',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Instead of putting all the logic in your OpMode, you can create a class for your subsystem (e.g., `Lift.java`). This class will contain its own state (`enum LiftState { GOING_UP, GOING_DOWN, HOLDING }`), its motors, and an `update()` method. The main OpMode loop will then simply call `lift.update()` on every single iteration.'
      },
      {
        type: LessonContentType.Code,
        code: `// Example: Lift.java
public class Lift {
    private DcMotor liftMotor;
    public enum LiftState { IDLE, GOING_UP, HOLDING }
    private LiftState currentState = LiftState.IDLE;
    private int targetPosition;

    // ... constructor to map hardware ...

    public void goToPosition(int pos) {
        targetPosition = pos;
        // We just set the state. We do NOT wait here.
        currentState = LiftState.GOING_UP; 
    }

    // This method is called repeatedly from the main OpMode loop
    public void update() {
        switch (currentState) {
            case GOING_UP:
                liftMotor.setTargetPosition(targetPosition);
                liftMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);
                liftMotor.setPower(1.0);
                // Once it arrives, change state to HOLDING
                if (!liftMotor.isBusy()) {
                    currentState = LiftState.HOLDING;
                }
                break;
            case HOLDING:
                // Motor power will stay on from RUN_TO_POSITION
                // to hold against gravity. No action needed.
                break;
            case IDLE:
                liftMotor.setPower(0);
                break;
        }
    }
}`
      },
      {
        type: LessonContentType.Heading,
        text: 'Integrating into TeleOp',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Your main TeleOp loop now becomes very clean. It just reads gamepad inputs and calls the `update()` methods for each subsystem. This is the core of professional robot code architecture.'
      },
      {
        type: LessonContentType.Code,
        code: `// In your TeleOp
Lift lift = new Lift(hardwareMap);
Drivetrain drivetrain = new Drivetrain(hardwareMap);

waitForStart();
while (opModeIsActive()) {
    // Read gamepads and tell subsystems what to do
    drivetrain.drive(gamepad1.left_stick_y, gamepad1.right_stick_x);
    
    if (gamepad1.y) {
        lift.goToPosition(LIFT_HIGH);
    } else if (gamepad1.a) {
        lift.goToPosition(LIFT_LOW);
    }

    // Update all subsystems. This runs the state machines.
    lift.update();
    drivetrain.update(); // Drivetrain might have its own update for things like telemetry
    telemetry.update();
}`
      },
    ],
    quiz: [
      {
        question: 'What is "blocking code" in the context of a TeleOp loop?',
        options: ['Code that is difficult to read.', 'Code that uses too much memory.', 'Code like `sleep()` that pauses the program and blocks input.', 'Code that is not part of a state machine.'],
        correctAnswer: 'Code like `sleep()` that pauses the program and blocks input.',
        explanation: 'A responsive TeleOp loop must run hundreds of times per second. Any blocking code will cause lag and make the robot feel uncontrollable.'
      },
      {
        question: 'In an asynchronous design, where does the logic for a subsystem like a lift reside?',
        options: ['Entirely within the main OpMode.', 'In a text file.', 'On the motor controller itself.', 'In its own class with a state machine and `update()` method.'],
        correctAnswer: 'In its own class with a state machine and `update()` method.',
        explanation: 'Encapsulating subsystem logic into its own class is a core principle of good robot software design. It makes the code organized, reusable, and easy to debug.'
      },
      {
        question: 'How does the main OpMode interact with an asynchronous subsystem?',
        options: ['It waits for the subsystem to finish each command.', 'It calls the subsystem\'s `update()` method on every iteration of the main loop.', 'It only calls it once at the beginning.', 'It reads variables directly from the subsystem class.'],
        correctAnswer: 'It calls the subsystem\'s `update()` method on every iteration of the main loop.',
        explanation: 'The OpMode is the "conductor." It tells each subsystem what its goal is (e.g., `lift.goToPosition()`) and then repeatedly calls `update()` on all of them, allowing each one to run its own logic in parallel without blocking.'
      }
    ]
  },
  {
    id: 'intermediate-final-test',
    type: 'test',
    title: 'Intermediate Final Test',
    isFinalTestForCourse: true,
    passingScore: 7,
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Intermediate Course Test',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'This test covers the intermediate lessons. You must score at least 7 out of 10 to pass and unlock the advanced course. Good luck!',
      }
    ],
    quiz: [
      {
        question: "In Road Runner, what is the most important prerequisite for accurate path following?",
        options: [
          "Having a fast robot.",
          "A precise and thorough tuning process.",
          "Using the largest possible wheels.",
          "Writing very long trajectories."
        ],
        correctAnswer: "A precise and thorough tuning process.",
        explanation: "Road Runner's accuracy is fundamentally dependent on having an accurate model of the robot. The tuning process provides the essential constants for this model."
      },
      {
        question: "You want to raise a lift halfway through a `splineTo()` maneuver in Road Runner. Which type of marker is best suited for this?",
        options: [
          "Displacement Marker",
          "Temporal Marker",
          "Spatial Marker",
          "Spline Marker"
        ],
        correctAnswer: "Displacement Marker",
        explanation: "A Displacement Marker triggers after a specific distance has been traveled along the path, making it ideal for actions that need to occur at a percentage of a movement's completion."
      },
      {
        question: "Why is it a good practice to disable the TensorFlow (TFOD) processor in your `VisionPortal` after it's no longer needed in an OpMode?",
        options: [
          "To save battery.",
          "The rules require it.",
          "To free up CPU resources for better performance.",
          "To prevent the camera from overheating."
        ],
        correctAnswer: "To free up CPU resources for better performance.",
        explanation: "Vision processing is one of the most CPU-intensive tasks. Turning it off when not needed allows the robot controller to dedicate more processing power to other critical tasks like motor control loops."
      },
      {
        question: "What is the primary problem with putting a `while(motor.isBusy())` loop inside your main TeleOp `while(opModeIsActive())` loop?",
        options: [
          "It's blocking code that freezes the loop and makes the robot unresponsive.",
          "It makes the code harder to read.",
          "It can cause the motor to burn out.",
          "It uses too much telemetry."
        ],
        correctAnswer: "It's blocking code that freezes the loop and makes the robot unresponsive.",
        explanation: "Any code that waits or sleeps inside the main TeleOp loop will stop the loop from repeating quickly, which is essential for responsive driver control. This logic should be handled asynchronously."
      },
      {
        question: "In Road Runner, what is the main functional difference between `.lineTo()` and `.splineTo()`?",
        options: [
          "`.lineTo()` is straight; `.splineTo()` is for smooth curves.",
          "`.lineTo()` is for autonomous, `.splineTo()` is for TeleOp.",
          "`.splineTo()` is less accurate than `.lineTo()`.",
          "There is no functional difference."
        ],
        correctAnswer: "`.lineTo()` is straight; `.splineTo()` is for smooth curves.",
        explanation: "Splines are what give Road Runner its characteristic fluid motion, enabling the robot to follow complex curves efficiently."
      },
      {
        question: "What is the primary purpose of the `FollowerPIDTuner` in the Road Runner tuning process?",
        options: [
            "To find the motor's max RPM.",
            "To tune the corrective PID controllers that keep the robot on the path.",
            "To set the robot's starting position.",
            "To test the robot's strafing distance."
        ],
        correctAnswer: "To tune the corrective PID controllers that keep the robot on the path.",
        explanation: "The follower PIDs (translational and heading) are what allow the robot to correct for small errors and precisely follow the generated trajectory."
      },
      {
          question: "In an asynchronous subsystem class (e.g., `Lift.java`), what is the role of the `update()` method?",
          options: [
              "To initialize the hardware.",
              "To stop all motors on the robot.",
              "To contain the state machine logic called by the main loop.",
              "To run only once when the subsystem is created."
          ],
          correctAnswer: "To contain the state machine logic called by the main loop.",
          explanation: "The OpMode tells the subsystem *what* to do (e.g., `lift.goToPosition()`), and the `update()` method, called every loop, handles *how* to do it without blocking."
      },
      {
          question: "When using `addTemporalMarker()` in a `TrajectorySequence`, the code inside the marker must be...",
          options: [
              "Very long and complex.",
              "Non-blocking, meaning it should execute instantly without waiting.",
              "Contained in a `while` loop.",
              "A `sleep()` command."
          ],
          correctAnswer: "Non-blocking, meaning it should execute instantly without waiting.",
          explanation: "Any blocking code inside a marker will halt Road Runner's control loop, causing jerky movement and inaccurate path following. Markers should only set states or target positions."
      },
      {
          question: "Why might a programmer manually decrease a camera's exposure using `ExposureControl` when detecting AprilTags?",
          options: [
              "To prevent the tag's white parts from being overexposed.",
              "To make the image brighter in a dark room.",
              "To save battery power.",
              "To increase the camera's frame rate."
          ],
          correctAnswer: "To prevent the tag's white parts from being overexposed.",
          explanation: "Overexposure causes a loss of detail. By lowering the exposure, the processor can more clearly distinguish the black and white areas of the tag, leading to more reliable detections."
      },
      {
          question: "What is the purpose of the `TrajectorySequenceBuilder` in Road Runner?",
          options: [
              "To build a multi-step autonomous routine.",
              "To define a single, uninterrupted curve.",
              "To tune the robot's PID controllers.",
              "To set the robot's final parking position."
          ],
          correctAnswer: "To build a multi-step autonomous routine.",
          explanation: "The builder pattern allows you to chain commands together in a readable way to create a full, multi-step autonomous path."
      }
    ]
  }
];

    
