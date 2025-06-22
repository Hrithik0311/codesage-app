
export interface QuizItem {
  question: string;
  correctAnswer: string;
  explanation: string;
}

export enum LessonContentType {
  Heading = 'heading',
  Paragraph = 'paragraph',
  Code = 'code',
  List = 'list',
}

export interface LessonContentItem {
  type: LessonContentType;
  text?: string;
  code?: string;
  items?: string[];
  url?: string;
  title?: string;
}

export interface Lesson {
  id: string;
  title: string;
  content: LessonContentItem[];
  quiz: QuizItem[];
}

export const ftcJavaLessons: Lesson[] = [
  {
    id: 'lesson1',
    title: 'Anatomy of an OpMode',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Welcome to your first lesson! Every robot program you write in FTC is called an **OpMode**. Let\'s break down the most common type, `LinearOpMode`.',
      },
      { type: LessonContentType.Heading, text: 'The `LinearOpMode` Structure' },
      {
        type: LessonContentType.Paragraph,
        text: 'A `LinearOpMode` runs from top to bottom. It has one main method, `runOpMode()`, which contains all of your robot\'s logic. The code is split into two main phases: **Initialization** and the **Run Loop**.',
      },
      {
        type: LessonContentType.Code,
        code: `/* Copyright (c) 2017 FIRST. All rights reserved. */

package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name="Basic: Linear OpMode", group="Linear Opmode")
public class BasicOpMode_Linear extends LinearOpMode {

    @Override
    public void runOpMode() {
        telemetry.addData("Status", "Initialized");
        telemetry.update();

        // Wait for the game to start (driver presses PLAY)
        waitForStart();

        // run until the end of the match (driver presses STOP)
        while (opModeIsActive()) {
            telemetry.addData("Status", "Running");
            telemetry.update();
        }
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Key Parts Explained' },
      {
        type: LessonContentType.List,
        items: [
            '<b><code>@TeleOp(...)</code>:</b> This is an *annotation* that registers your OpMode so it appears in the list on the Driver Hub. `name` is what you see, and `group` helps you organize OpModes.',
            '<b><code>public class ... extends LinearOpMode</code>:</b> This declares your class. By *extending* `LinearOpMode`, your class inherits all the basic FTC functionality.',
            '<b><code>runOpMode()</code>:</b> This is the main method where your code lives.',
            '<b><code>telemetry</code>:</b> An object used to send text messages to the Driver Hub screen. Crucial for debugging!',
            '<b><code>waitForStart()</code>:</b> This is a critical line! Code before this runs when you press **INIT**. The code after it only runs after the driver presses **PLAY**.',
            '<b><code>while (opModeIsActive())</code>:</b> This is the main loop. Code inside this block will repeat over and over again until the driver presses **STOP**.'
        ]
      }
    ],
    quiz: [
      {
        question: 'What is the purpose of the `@TeleOp` annotation?',
        correctAnswer: 'To register the OpMode on the Driver Hub list',
        explanation: 'The `@TeleOp(...)` annotation tells the FTC app that this class is a runnable OpMode and defines the name and group that will appear on the selection screen.'
      },
      {
        question: 'Code placed BEFORE `waitForStart()` runs when you press...',
        correctAnswer: 'INIT',
        explanation: 'The section before `waitForStart()` is for initialization. It runs as soon as you select the OpMode and press the INIT button on the Driver Hub.'
      },
      {
        question: 'What does the `while (opModeIsActive())` loop do?',
        correctAnswer: 'Repeats the code inside it until the driver presses STOP',
        explanation: 'This is the main run loop. `opModeIsActive()` is `true` after PLAY is pressed and becomes `false` when STOP is pressed, ending the loop.'
      }
    ],
  },
  {
    id: 'lesson2',
    title: 'Hardware Mapping',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'To control your robot, your code needs to know about its physical parts. This is done through the `hardwareMap`.',
      },
      { type: LessonContentType.Heading, text: 'The Hardware Map' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `hardwareMap` is an object provided by the FTC SDK that acts as a bridge between your software and the robot\'s configured hardware. You use it to get a reference to specific motors, servos, and sensors.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'It is **critical** that the text name you use in the code (e.g., `"left_drive"`) **exactly matches** the name you gave that component in the Robot Configuration screen on the Robot Controller.',
      },
      {
        type: LessonContentType.Code,
        code: `/* Copyright (c) 2022 FIRST. All rights reserved. */

package org.firstinspires.ftc.robotcontroller.external.samples;

import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.hardware.HardwareMap;

public class RobotHardware {
    /* Declare OpMode members. */
    public DcMotor  leftDrive   = null;
    public DcMotor  rightDrive  = null;
    public DcMotor  leftArm     = null;
    public Servo    leftClaw    = null;
    public Servo    rightClaw   = null;

    public final static double ARM_UP_POWER    =  0.60;
    public final static double ARM_DOWN_POWER  = -0.45;

    /* local OpMode members. */
    HardwareMap hwMap = null;

    /* Initialize standard Hardware interfaces */
    public void init(HardwareMap ahwMap) {
        // Save reference to Hardware map
        hwMap = ahwMap;

        // Define and Initialize Motors and Servos
        leftDrive  = hwMap.get(DcMotor.class, "left_drive");
        rightDrive = hwMap.get(DcMotor.class, "right_drive");
        leftArm    = hwMap.get(DcMotor.class, "left_arm");
        
        // Set all motors to run without encoders by default
        leftDrive.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        rightDrive.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        leftArm.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);

        // Define and initialize ALL installed servos.
        leftClaw  = hwMap.get(Servo.class, "left_hand");
        rightClaw = hwMap.get(Servo.class, "right_hand");
    }
 }
`,
      },
      { type: LessonContentType.Heading, text: 'Good Practice: The Hardware Class' },
      {
        type: LessonContentType.Paragraph,
        text: 'The code above shows a common FTC design pattern: a dedicated `RobotHardware` class. Instead of declaring all your hardware in every OpMode, you create one class to handle all hardware initialization. This makes your code cleaner, more organized, and easier to maintain.'
      }
    ],
    quiz: [
      { 
        question: "What is the purpose of `hardwareMap.get()`?", 
        correctAnswer: "To retrieve a reference to a configured hardware device",
        explanation: "The `hardwareMap.get()` method takes the device type (e.g., `DcMotor.class`) and its configured name to link your code variable to the physical device."
      },
      { 
        question: "What happens if the name in `hardwareMap.get(DcMotor.class, \"motor_a\")` doesn't match the robot configuration?", 
        correctAnswer: "The code will crash when you press INIT",
        explanation: "This is a very common error. If the hardware map cannot find a device with the exact name you provided, your OpMode will fail to initialize and the app will stop."
      },
      { 
        question: "Why is creating a separate `RobotHardware` class a good idea?", 
        correctAnswer: "It centralizes all hardware initialization, reducing code duplication",
        explanation: "By having one hardware class, you can initialize your robot with one line in any OpMode (`robot.init(hardwareMap)`) instead of repeating all the `hardwareMap.get()` calls."
      }
    ],
  },
  { 
    id: 'lesson3', 
    title: 'Controlling Motors', 
    content: [
        {type: LessonContentType.Paragraph, text:"Motors are the heart of your robot. Learning to control them precisely is key to building a competitive robot."},
        {type: LessonContentType.Heading, text:"Setting Motor Direction"},
        {type: LessonContentType.Paragraph, text:"On a standard drivetrain, motors on opposite sides are mounted as mirror images of each other. To make them both drive the robot forward, one side must be electronically reversed."},
        {type: LessonContentType.Code, code: `// In your initialization
leftDrive.setDirection(DcMotor.Direction.FORWARD);
rightDrive.setDirection(DcMotor.Direction.REVERSE);`},
        {type: LessonContentType.Heading, text:"Setting Motor Power"},
        {type: LessonContentType.Paragraph, text:"Motor power is set with a value from **-1.0** (full power reverse) to **+1.0** (full power forward). A value of **0** is stop. You will update these power values continuously inside your main `while` loop based on gamepad input."},
        {type: LessonContentType.Code, code: `// Inside the while(opModeIsActive()) loop
double leftPower = -gamepad1.left_stick_y;
double rightPower = -gamepad1.right_stick_y;

// Send calculated power to wheels
leftDrive.setPower(leftPower);
rightDrive.setPower(rightPower);`},
        {type: LessonContentType.Heading, text:"Stopping the Motors"},
        {type: LessonContentType.Paragraph, text:"It's good practice to ensure all motors are stopped when your OpMode ends. You can do this by setting their power to 0 after the `while` loop finishes."},
        {type: LessonContentType.Code, code:`// After the while loop exits
leftDrive.setPower(0);
rightDrive.setPower(0);`}
    ], 
    quiz: [
        {
          question: "What is the valid range for motor power values passed to `.setPower()`?", 
          correctAnswer: "-1.0 to 1.0",
          explanation: "Motor power is represented as a decimal from -1.0 (full reverse) to 1.0 (full forward), with 0 indicating the motor should stop."
        },
        {
          question: "Why do you typically need to set one side of a drivetrain to `DcMotor.Direction.REVERSE`?", 
          correctAnswer: "Because motors on opposite sides are physically mirrored",
          explanation: "For both sides to spin the wheels in the same direction (e.g., forward), one side's motor must be told to run in reverse from an electrical standpoint."
        },
        {
          question: "Where should you put the code that sets motor power based on gamepad input?", 
          correctAnswer: "Inside the `while (opModeIsActive())` loop",
          explanation: "You need to continuously check the gamepad values and update the motor power in every iteration of the loop to have real-time control."
        }
    ] 
  },
  { 
    id: 'lesson4', 
    title: 'Reading Sensors: The IMU', 
    content: [
        {type: LessonContentType.Paragraph, text:"Sensors give your robot the ability to perceive its environment. The most important sensor for autonomous navigation is the Inertial Measurement Unit, or IMU."},
        {type: LessonContentType.Heading, text:"What is an IMU?"},
        {type: LessonContentType.Paragraph, text:"The IMU is a sensor built into the Control Hub or Expansion Hub. It contains a gyroscope and accelerometer, which allow it to measure the robot's orientation (which way it's facing) and rotation."},
        {type: LessonContentType.Heading, text:"Initializing the IMU"},
        {type: LessonContentType.Paragraph, text:"Like a motor, the IMU must be initialized from the hardware map. You also need to provide it with parameters, such as the logo direction and USB port orientation on your robot."},
        {type: LessonContentType.Code, code: `// In your hardware class or before waitForStart()
IMU imu = hardwareMap.get(IMU.class, "imu");
IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
    RevHubOrientationOnRobot.LogoFacingDirection.UP,
    RevHubOrientationOnRobot.UsbFacingDirection.FORWARD));
imu.initialize(parameters);`},
        {type: LessonContentType.Heading, text:"Getting the Robot's Heading"},
        {type: LessonContentType.Paragraph, text:"Once initialized, you can get the robot's yaw (its rotation on the flat plane) at any time. This is fundamental for making precise turns in autonomous."},
        {type: LessonContentType.Code, code:`// Inside your while loop
double yawAngle = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
telemetry.addData("Yaw", "%.2f", yawAngle);
telemetry.update();`}
    ], 
    quiz: [
        {
          question: "What does an IMU primarily measure for an FTC robot?", 
          correctAnswer: "The robot's orientation and rotational angle",
          explanation: "The IMU (Inertial Measurement Unit) is key for tracking the robot's heading, which is essential for making accurate turns in autonomous mode."
        },
        {
          question: "What information do you need to provide when initializing the IMU?", 
          correctAnswer: "The orientation of the Control Hub on your robot",
          explanation: "The IMU needs to know how it is mounted (e.g., logo facing up, USB port facing forward) to provide accurate angle readings relative to the robot."
        },
        {
          question: "The 'Yaw' angle from the IMU represents what?", 
          correctAnswer: "The robot's rotation on the flat ground (like turning left or right)",
          explanation: "In a 3D space, 'Yaw' is the term for rotation around the vertical axis, which corresponds to turning left and right for an FTC robot."
        }
    ] 
  },
  { 
    id: 'lesson5', 
    title: 'Advanced Gamepad Controls', 
    content: [
        {type: LessonContentType.Paragraph, text:"Drivers control the robot using gamepads. The FTC SDK provides `gamepad1` and `gamepad2` to read their inputs."},
        {type: LessonContentType.Heading, text:"Joystick and Button Inputs"},
        {type: LessonContentType.List, items: ["<b>Joysticks:</b> Return decimal values from -1.0 to 1.0. Example: `gamepad1.left_stick_y`", "<b>Buttons:</b> Return boolean values (`true` or `false`). Example: `gamepad1.a`", "<b>Triggers:</b> Return decimal values from 0.0 to 1.0. Example: `gamepad1.right_trigger`"]},
        {type: LessonContentType.Heading, text:"Tank Drive Example"},
        {type: LessonContentType.Paragraph, text:"Tank Drive is a common control scheme where each joystick on one side controls the motors on that same side of the robot."},
        {type: LessonContentType.Code, code: `// Inside the while(opModeIsActive()) loop
// POV Mode uses left stick to go forward, and right stick to turn.
// - This uses basic math to combine motions and is easier to drive straight.
double drive = -gamepad1.left_stick_y;
double turn  =  gamepad1.right_stick_x;
double leftPower  = drive + turn;
double rightPower = drive - turn;

// Send calculated power to wheels
// Use Math.max and Math.min to clip the values to the -1.0 to 1.0 range
leftDrive.setPower(Math.max(-1.0, Math.min(leftPower, 1.0)));
rightDrive.setPower(Math.max(-1.0, Math.min(rightPower, 1.0)));`},
        {type: LessonContentType.Heading, text:"Toggle and One-Shot Logic"},
        {type: LessonContentType.Paragraph, text:"A common challenge is making a button press perform an action only once, not for as long as it's held down. This requires tracking the button's previous state."},
        {type: LessonContentType.Code, code:`boolean a_was_pressed = false;
boolean claw_is_open = false;
// ... inside loop
boolean a_is_pressed = gamepad1.a;
if (a_is_pressed && !a_was_pressed) {
    // The 'a' button was just pressed!
    claw_is_open = !claw_is_open; // Toggle the state
}
a_was_pressed = a_is_pressed;
// Now set servo position based on claw_is_open`}
    ], 
    quiz: [
        {
          question: "In the code `double drive = -gamepad1.left_stick_y;`, why is the value often negated?", 
          correctAnswer: "Because gamepads consider 'up' on the Y-axis to be a negative value",
          explanation: "By convention for most controllers, pushing a joystick forward results in a negative Y value. We multiply by -1 so that pushing forward corresponds to positive motor power."
        },
        {
          question: "What is the difference between a button input (`gamepad1.a`) and a trigger input (`gamepad1.right_trigger`)?", 
          correctAnswer: "`a` returns a boolean (true/false), while `right_trigger` returns a float (0.0 to 1.0)",
          explanation: "Buttons like 'a' are digital (on/off). Triggers are analog and report how far they are being pressed, which is useful for variable speed control."
        },
        {
          question: "What is the purpose of tracking the previous state of a button (e.g., `a_was_pressed`)?", 
          correctAnswer: "To make a button press perform an action only once, on the initial press",
          explanation: "This logic creates a 'rising edge detector'. The action inside the `if` statement only runs on the single loop cycle where the button changes from not pressed to pressed."
        }
    ] 
  }
];
