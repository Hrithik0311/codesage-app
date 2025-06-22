
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
    title: '1. Anatomy of an OpMode',
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
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name="Basic: Linear OpMode", group="Linear Opmode")
public class BasicOpMode_Linear extends LinearOpMode {

    @Override
    public void runOpMode() {
        // Code here runs during the INIT phase
        telemetry.addData("Status", "Initialized");
        telemetry.update();

        // Wait for the game to start (driver presses PLAY)
        waitForStart();

        // Code below runs ONCE when the driver presses PLAY

        // The main run loop, continues until driver presses STOP
        while (opModeIsActive()) {
            telemetry.addData("Status", "Running");
            telemetry.update();

            // The loop repeats here
        }
        
        // Code below runs ONCE when the driver presses STOP
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
    title: '2. Hardware Mapping',
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
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.Servo;

public class MyRobotHardware {
    /* Declare hardware members */
    public DcMotor  leftDrive   = null;
    public DcMotor  rightDrive  = null;
    public Servo    armServo    = null;

    /* Initialize standard Hardware interfaces */
    public void init(HardwareMap hwMap) {
        // Define and Initialize Motors
        leftDrive  = hwMap.get(DcMotor.class, "left_drive");
        rightDrive = hwMap.get(DcMotor.class, "right_drive");
        
        // Define and Initialize Servos
        armServo = hwMap.get(Servo.class, "arm_servo");
    }
 }`,
      },
      { type: LessonContentType.Heading, text: 'Good Practice: The Hardware Class' },
      {
        type: LessonContentType.Paragraph,
        text: 'The code above shows a common FTC design pattern: a dedicated `MyRobotHardware` class. Instead of declaring all your hardware in every OpMode, you create one class to handle all hardware initialization. This makes your code cleaner, more organized, and easier to maintain.'
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
    title: '3. Controlling Motors', 
    content: [
        {type: LessonContentType.Paragraph, text:"Motors are the heart of your robot. Learning to control them precisely is key to building a competitive robot."},
        {type: LessonContentType.Heading, text:"Setting Motor Direction"},
        {type: LessonContentType.Paragraph, text:"On a standard drivetrain, motors on opposite sides are mounted as mirror images of each other. To make them both drive the robot forward, one side must be electronically reversed."},
        {type: LessonContentType.Code, code: `// In your initialization
leftDrive.setDirection(DcMotor.Direction.FORWARD);
rightDrive.setDirection(DcMotor.Direction.REVERSE); // This motor is mounted backwards`},
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
    title: '4. Controlling Servos', 
    content: [
        {type: LessonContentType.Paragraph, text:"Servos are used for precise, positional movements, like operating claws, arms, or other mechanisms."},
        {type: LessonContentType.Heading, text:"Understanding Servo Position"},
        {type: LessonContentType.Paragraph, text:"Unlike motors that run continuously, servos move to a specific position and hold it. This position is set with a value from **0.0** to **1.0**, which represents the servo's full range of motion. The exact angle depends on the specific servo you are using."},
        {type: LessonContentType.Code, code: `// In your initialization
// Assume you have an 'armServo' mapped in a hardware class
// Set an initial position
armServo.setPosition(0.5); // Move to the middle position`},
        {type: LessonContentType.Heading, text:"Controlling a Servo with Buttons"},
        {type: LessonContentType.Paragraph, text:"You can use gamepad buttons to move a servo to predefined positions, like an 'open' or 'closed' position for a claw."},
        {type: LessonContentType.Code, code: `// Define constants for your positions
static final double CLAW_OPEN_POS = 0.8;
static final double CLAW_CLOSED_POS = 0.2;

// Inside the while(opModeIsActive()) loop
if (gamepad1.a) {
    clawServo.setPosition(CLAW_OPEN_POS);
} else if (gamepad1.b) {
    clawServo.setPosition(CLAW_CLOSED_POS);
}`},
    ], 
    quiz: [
        {
          question: "What is the value range for setting a servo's position?", 
          correctAnswer: "0.0 to 1.0",
          explanation: "A servo's position is set using a decimal value where 0.0 is one end of its range of motion and 1.0 is the other end."
        },
        {
          question: "What is the main difference between a motor and a servo?", 
          correctAnswer: "Motors provide continuous rotation, while servos move to specific positions.",
          explanation: "You set a 'power' for a motor to make it spin, but you set a 'position' for a servo to make it move to and hold a specific angle."
        },
        {
          question: "Why is it a good idea to use constants (like `CLAW_OPEN_POS`) for servo positions?", 
          correctAnswer: "It makes the code more readable and easier to adjust.",
          explanation: "Using named constants like `CLAW_OPEN_POS` makes your code self-documenting. If you need to tweak the position, you only have to change it in one place."
        }
    ] 
  },
  { 
    id: 'lesson5', 
    title: '5. Gamepad Inputs', 
    content: [
        {type: LessonContentType.Paragraph, text:"Drivers control the robot using gamepads. The FTC SDK provides `gamepad1` and `gamepad2` to read their inputs."},
        {type: LessonContentType.Heading, text:"Joystick, Button, and Trigger Inputs"},
        {type: LessonContentType.List, items: ["<b>Joysticks:</b> Return decimal values from -1.0 to 1.0. Example: `gamepad1.left_stick_y`", "<b>Buttons:</b> Return boolean values (`true` or `false`). Example: `gamepad1.a`", "<b>Triggers:</b> Return decimal values from 0.0 to 1.0. Example: `gamepad1.right_trigger`"]},
        {type: LessonContentType.Heading, text:"Mecanum Drive Example"},
        {type: LessonContentType.Paragraph, text:"Mecanum drive is a popular control scheme that allows for movement in any direction (holonomic drive). It uses inputs from both joysticks to calculate power for four motors."},
        {type: LessonContentType.Code, code: `// Inside the while(opModeIsActive()) loop
double y = -gamepad1.left_stick_y; // Remember, this is reversed!
double x = gamepad1.left_stick_x * 1.1; // Counteract imperfect strafing
double rx = gamepad1.right_stick_x;

// Denominator is the largest motor power (absolute value) or 1
// This ensures all powers are scaled down proportionally if the calculations exceed 1.0
double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);
double frontLeftPower = (y + x + rx) / denominator;
double backLeftPower = (y - x + rx) / denominator;
double frontRightPower = (y - x - rx) / denominator;
double backRightPower = (y + x - rx) / denominator;

frontLeftMotor.setPower(frontLeftPower);
backLeftMotor.setPower(backLeftPower);
frontRightMotor.setPower(frontRightPower);
backRightMotor.setPower(backRightPower);`},
    ], 
    quiz: [
        {
          question: "In the code `double y = -gamepad1.left_stick_y;`, why is the value often negated?", 
          correctAnswer: "Because gamepads consider 'up' on the Y-axis to be a negative value",
          explanation: "By convention for most controllers, pushing a joystick forward results in a negative Y value. We multiply by -1 so that pushing forward corresponds to positive motor power."
        },
        {
          question: "What is the difference between a button input (`gamepad1.a`) and a trigger input (`gamepad1.right_trigger`)?", 
          correctAnswer: "`a` returns a boolean (true/false), while `right_trigger` returns a float (0.0 to 1.0)",
          explanation: "Buttons like 'a' are digital (on/off). Triggers are analog and report how far they are being pressed, which is useful for variable speed control."
        },
        {
          question: "In mecanum drive, what does the 'x' variable from the joystick typically control?", 
          correctAnswer: "Strafing (side-to-side movement)",
          explanation: "The left stick's Y-axis controls forward/backward movement, while its X-axis controls side-to-side (strafing) movement."
        }
    ] 
  },
  {
    id: 'lesson6',
    title: '6. Using Telemetry',
    content: [
      {type: LessonContentType.Paragraph, text: 'Telemetry is your best friend for debugging. It allows you to print data from your robot directly to the Driver Hub screen.'},
      {type: LessonContentType.Heading, text: 'Adding and Updating Data'},
      {type: LessonContentType.Paragraph, text: 'You can add data in key-value pairs using `telemetry.addData()`. This stages the data for display, but it won\'t actually appear on the screen until you call `telemetry.update()`. This is important because you usually want to send a full batch of updated values at once in your main loop.'},
      {type: LessonContentType.Code, code: `// Inside the while(opModeIsActive()) loop
double leftPower = -gamepad1.left_stick_y;
double rightPower = -gamepad1.right_stick_y;
leftDrive.setPower(leftPower);
rightDrive.setPower(rightPower);

// Add telemetry data
telemetry.addData("Status", "Running");
telemetry.addData("Left Stick Y", gamepad1.left_stick_y);
telemetry.addData("Right Stick Y", gamepad1.right_stick_y);
telemetry.addData("Left Motor Power", leftPower);
telemetry.addData("Right Motor Power", rightPower);

// Update the screen with all the staged data
telemetry.update();`},
      {type: LessonContentType.Heading, text: 'Formatting Output'},
      {type: LessonContentType.Paragraph, text: 'You can format numbers to a specific number of decimal places, which is very useful for cleaning up the display. This is done using a format string.'},
      {type: LessonContentType.Code, code: `double someValue = 0.123456789;
// The "%.2f" format string means "format as a floating point number with 2 decimal places"
telemetry.addData("Formatted Value", "%.2f", someValue);
// This will display "Formatted Value: 0.12"`},
    ],
    quiz: [
      {
        question: 'What is the function of `telemetry.update()`?',
        correctAnswer: 'It sends all the data you added with `addData` to the Driver Hub screen.',
        explanation: '`telemetry.addData()` only stages data. `telemetry.update()` is the command that actually transmits the data to be displayed.'
      },
      {
        question: 'Why should `telemetry.update()` be called inside the main `while` loop?',
        correctAnswer: 'To continuously refresh the data on the screen with the latest values.',
        explanation: 'Since sensor and gamepad values are always changing, you need to call `update()` in every loop iteration to see those changes in real-time.'
      },
      {
        question: 'What would `telemetry.addData("Arm Position", "%.3f", 0.7654)` display?',
        correctAnswer: 'Arm Position: 0.765',
        explanation: 'The format string "%.3f" specifies that the floating-point number should be rounded to and displayed with exactly three decimal places.'
      }
    ],
  },
  { 
    id: 'lesson7', 
    title: '7. Intro to Sensors: The IMU', 
    content: [
        {type: LessonContentType.Paragraph, text:"Sensors give your robot the ability to perceive its environment. The most important sensor for autonomous navigation is the Inertial Measurement Unit, or IMU."},
        {type: LessonContentType.Heading, text:"What is an IMU?"},
        {type: LessonContentType.Paragraph, text:"The IMU is a sensor built into the Control Hub or Expansion Hub. It contains a gyroscope and accelerometer, which allow it to measure the robot's orientation (which way it's facing) and rotation."},
        {type: LessonContentType.Heading, text:"Initializing the IMU"},
        {type: LessonContentType.Paragraph, text:"Like a motor, the IMU must be initialized from the hardware map. You also need to provide it with parameters, such as the logo direction and USB port orientation on your robot. This tells the IMU how it's mounted so its readings are accurate relative to the robot's frame."},
        {type: LessonContentType.Code, code: `// Declare our IMU
IMU imu;

// In your initialization
imu = hardwareMap.get(IMU.class, "imu");
IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
    RevHubOrientationOnRobot.LogoFacingDirection.UP,
    RevHubOrientationOnRobot.UsbFacingDirection.FORWARD));
imu.initialize(parameters);`},
        {type: LessonContentType.Heading, text:"Getting the Robot's Heading"},
        {type: LessonContentType.Paragraph, text:"Once initialized, you can get the robot's yaw (its rotation on the flat plane) at any time. This is fundamental for making precise turns in autonomous. It's also useful to have a function to reset the yaw to zero at the start of autonomous."},
        {type: LessonContentType.Code, code:`// Reset the robot's yaw angle to zero
imu.resetYaw();

// Inside your loop, get the current angle
double yawAngle = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);
telemetry.addData("Yaw (Degrees)", "%.2f", yawAngle);
telemetry.update();`}
    ], 
    quiz: [
        {
          question: "What does an IMU primarily measure for an FTC robot?", 
          correctAnswer: "The robot's orientation and rotational angle",
          explanation: "The IMU (Inertial Measurement Unit) is key for tracking the robot's heading (its yaw), which is essential for making accurate turns in autonomous mode."
        },
        {
          question: "What is the purpose of `imu.resetYaw()`?", 
          correctAnswer: "To set the robot's current heading as the zero-degree reference point",
          explanation: "Calling `resetYaw()` is crucial at the start of an autonomous OpMode to ensure all subsequent turns are measured from a known starting orientation."
        },
        {
          question: "The 'Yaw' angle from the IMU represents what?", 
          correctAnswer: "The robot's rotation on the flat ground (like turning left or right)",
          explanation: "In a 3D space, 'Yaw' is the term for rotation around the vertical axis, which corresponds to turning left and right for an FTC robot."
        }
    ] 
  },
  {
    id: 'lesson8',
    title: '8. Basic Autonomous Logic',
    content: [
      {type: LessonContentType.Paragraph, text: 'Autonomous is all about performing a sequence of actions without driver input. The simplest way to do this is with time-based movements.'},
      {type: LessonContentType.Heading, text: 'Time-Based Movement'},
      {type: LessonContentType.Paragraph, text: 'You can create a simple autonomous path by telling motors to run for a certain amount of time. The `sleep()` function pauses your OpMode for a specified number of milliseconds.'},
      {type: LessonContentType.Code, code: `// This code would be after waitForStart()

// Step 1: Drive forward for 1 second
leftDrive.setPower(0.5);
rightDrive.setPower(0.5);
sleep(1000); // Pauses for 1000 milliseconds (1 second)

// Step 2: Turn right for 0.5 seconds
leftDrive.setPower(0.5);
rightDrive.setPower(-0.5);
sleep(500);

// Step 3: Stop all motors
leftDrive.setPower(0);
rightDrive.setPower(0);`},
      {type: LessonContentType.Heading, text: 'Limitations of Time'},
      {type: LessonContentType.Paragraph, text: 'Time-based autonomous is a great starting point, but it has a major weakness: it is not reliable. Changes in battery voltage throughout a match will cause the robot to travel different distances in the same amount of time. A freshly charged battery will make the robot drive farther and turn more than a depleted one. For more precise control, we need sensors, which we will cover next.'}
    ],
    quiz: [
      {
        question: 'What does the function `sleep(2500)` do?',
        correctAnswer: 'Pauses the OpMode for 2.5 seconds.',
        explanation: 'The `sleep()` function takes an argument in milliseconds. Since there are 1000 milliseconds in a second, 2500 ms is equal to 2.5 seconds.'
      },
      {
        question: 'What is the main disadvantage of a time-based autonomous program?',
        correctAnswer: 'It is inconsistent and affected by battery voltage.',
        explanation: 'As the battery drains, the power delivered to the motors for a given power setting decreases. This means the robot will move slower and cover less distance in the same amount of time, making the routine unreliable.'
      },
      {
        question: 'To make the robot turn in place, what should you do?',
        correctAnswer: 'Set the motors on opposite sides to opposite powers (e.g., one positive, one negative).',
        explanation: 'By making the wheels on the left and right spin in opposite directions, the robot will pivot in place. Setting them to the same power makes it drive straight.'
      }
    ],
  },
  {
    id: 'lesson9',
    title: '9. Using Motor Encoders',
    content: [
      {type: LessonContentType.Paragraph, text: 'To make autonomous movements precise and repeatable, we need to use motor encoders. Encoders measure how much a motor shaft has actually rotated.'},
      {type: LessonContentType.Heading, text: 'Encoder-Based Run Modes'},
      {type: LessonContentType.Paragraph, text: 'FTC motors have several `RunMode`s. The two most important for autonomous are:'},
      {type: LessonContentType.List, items: [
        '<b><code>RunMode.STOP_AND_RESET_ENCODER</code>:</b> This sets the current encoder reading to 0.',
        '<b><code>RunMode.RUN_TO_POSITION</code>:</b> This tells the motor to run with PID control until it reaches a specific target encoder position you set.'
      ]},
      {type: LessonContentType.Heading, text: 'Driving to a Target Position'},
      {type: LessonContentType.Paragraph, text: 'The process involves resetting the encoders, setting a target position, setting a power, and then switching the mode to `RUN_TO_POSITION`. The motor controller will then handle the rest.'},
      {type: LessonContentType.Code, code: `// Set target position for both motors (e.g., 1000 encoder ticks)
leftDrive.setTargetPosition(1000);
rightDrive.setTargetPosition(1000);

// Set mode to RUN_TO_POSITION
leftDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);
rightDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);

// Set motor power
leftDrive.setPower(0.5);
rightDrive.setPower(0.5);

// Loop until both motors have reached their target
// isBusy() returns true as long as the motor is running to a target
while (opModeIsActive() && leftDrive.isBusy() && rightDrive.isBusy()) {
    telemetry.addData("Left Pos", leftDrive.getCurrentPosition());
    telemetry.addData("Right Pos", rightDrive.getCurrentPosition());
    telemetry.update();
}

// Stop all motion
leftDrive.setPower(0);
rightDrive.setPower(0);

// Optional: Turn off RUN_TO_POSITION
leftDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
rightDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
`},
    ],
    quiz: [
      {
        question: 'What does a motor encoder measure?',
        correctAnswer: 'The amount of rotation of the motor shaft.',
        explanation: 'Encoders are rotational sensors that output "ticks" as the motor spins, allowing you to precisely measure how far it has turned, which corresponds to distance traveled.'
      },
      {
        question: 'What is the purpose of the `RUN_TO_POSITION` motor mode?',
        correctAnswer: 'To make the motor automatically run to a specific encoder tick count and then stop.',
        explanation: 'In this mode, the motor uses an internal PID controller to precisely reach the `targetPosition` you set. The `isBusy()` method lets you know when it has arrived.'
      },
      {
        question: 'What should you do before setting a new target position for an autonomous movement?',
        correctAnswer: 'Reset the encoders using `STOP_AND_RESET_ENCODER`.',
        explanation: 'Resetting the encoders to 0 ensures that your movement is measured from the robot\'s current position, not from a leftover value from a previous movement.'
      }
    ],
  },
  {
    id: 'lesson10',
    title: '10. Autonomous State Machines',
    content: [
      {type: LessonContentType.Paragraph, text: 'For complex autonomous routines, a "state machine" is a powerful way to organize your code. It allows you to define a sequence of steps and transition between them cleanly.'},
      {type: LessonContentType.Heading, text: 'Defining States'},
      {type: LessonContentType.Paragraph, text: 'We can define our robot\'s different autonomous steps using an `enum`. An enum is a special data type that enables a variable to be one of a set of predefined constants.'},
      {type: LessonContentType.Code, code: `// Define the states for our autonomous routine
enum AutoState {
    START,
    DRIVE_FORWARD,
    TURN_LEFT,
    DROP_PIXEL,
    PARK,
    STOP
}`},
      {type: LessonContentType.Heading, text: 'Implementing the State Machine'},
      {type: LessonContentType.Paragraph, text: 'In our main loop, we use a `switch` statement to execute different code based on the current state. Each state is responsible for performing an action and then changing the state to the next step in the sequence.'},
      {type: LessonContentType.Code, code: `// Set the initial state
AutoState currentState = AutoState.START;

while (opModeIsActive()) {
    switch (currentState) {
        case START:
            // This is a good place to do initial setup, like closing a claw
            currentState = AutoState.DRIVE_FORWARD;
            break;
        case DRIVE_FORWARD:
            // Use encoders to drive forward a set distance
            driveForward(24); // Assume this is a helper function
            currentState = AutoState.TURN_LEFT;
            break;
        case TURN_LEFT:
            // Use the IMU to turn left 90 degrees
            turn(-90); // Assume this is a helper function
            currentState = AutoState.DROP_PIXEL;
            break;
        case DROP_PIXEL:
            // Open a servo to drop a pixel
            openClaw(); // Assume this is a helper function
            currentState = AutoState.PARK;
            break;
        case PARK:
            // Drive forward a short distance to park
            driveForward(6);
            currentState = AutoState.STOP;
            break;
        case STOP:
            // Do nothing, the routine is complete
            break;
    }
}`},
    ],
    quiz: [
      {
        question: 'What is the primary benefit of using a state machine in autonomous?',
        correctAnswer: 'It organizes complex sequences of actions into clear, manageable steps.',
        explanation: 'State machines prevent a single, long, and confusing autonomous file by breaking the routine into logical states (like DRIVE, TURN, LIFT_ARM) that are easy to debug and modify.'
      },
      {
        question: 'What is an `enum` used for in a state machine?',
        correctAnswer: 'To define a set of named constants for each possible state.',
        explanation: 'Using an enum like `AutoState.DRIVE_FORWARD` is much more readable and less error-prone than using magic numbers (like 1 for drive, 2 for turn).'
      },
      {
        question: 'In a state machine, what is each state responsible for?',
        correctAnswer: 'Performing its action and then transitioning to the next state.',
        explanation: 'The core logic of a state is to do its job (e.g., drive forward) and then update the `currentState` variable to the next desired state, which the `switch` statement will pick up on the next loop iteration.'
      }
    ],
  },
];
