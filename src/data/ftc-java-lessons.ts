
export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export enum LessonContentType {
  Heading = 'heading',
  Paragraph = 'paragraph',
  Code = 'code',
  List = 'list',
  SectionBreak = 'section_break',
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
  type: 'placement' | 'lesson' | 'test';
  content: LessonContentItem[];
  quiz: QuizItem[];
  isFinalTestForCourse?: boolean;
  passingScore?: number; // Raw score for tests
}

export const ftcJavaLessons: Lesson[] = [
  // =================================================================
  // BEGINNER SECTION
  // =================================================================
  {
    id: 'lesson1',
    type: 'lesson',
    title: '1. Your First OpMode',
    content: [
      {
        type: LessonContentType.SectionBreak,
        text: 'Beginner',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Welcome to your first lesson in programming for FTC! Every program you write that runs on the robot is an **OpMode**. We use the **Java** programming language to create these OpModes. There are two main types: `LinearOpMode` and `OpMode`. We\'ll start with `LinearOpMode` because it\'s simpler to understand.',
      },
      { type: LessonContentType.Heading, text: 'The `LinearOpMode` Structure' },
      {
        type: LessonContentType.Paragraph,
        text: 'A `LinearOpMode` runs your code sequentially, from top to bottom. It has one main method you must implement, `runOpMode()`, which is logically split into two phases: **Initialization** and the **Run Loop**.',
      },
      {
        type: LessonContentType.Code,
        code: `// This tells Java which 'packages' or libraries of code we are using.
package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

// The @TeleOp annotation registers this OpMode to show up on the Driver Hub.
@TeleOp(name="My First OpMode", group="Tutorial")
public class BasicOpMode_Linear extends LinearOpMode {

    // This is the main method that the FTC app will run.
    @Override
    public void runOpMode() {
        // =======================================================
        // INITIALIZATION PHASE: Code here runs when you press INIT.
        // =======================================================
        
        // Use telemetry to send messages to the Driver Hub screen.
        telemetry.addData("Status", "Initialized");
        telemetry.addData(">", "Press Play to start.");
        telemetry.update();

        // Wait for the game to start (driver presses PLAY on the Driver Hub)
        waitForStart();

        // =======================================================
        // RUN LOOP: Code here runs repeatedly after you press PLAY.
        // =======================================================
        while (opModeIsActive()) {
            telemetry.addData("Status", "Running");
            telemetry.addData("Runtime", getRuntime()); // getRuntime() is a built-in timer.
            telemetry.update();

            // The loop repeats here until you press STOP.
        }
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Key Parts Explained' },
      {
        type: LessonContentType.List,
        items: [
          '<b><code>@TeleOp(...)</code>:</b> This is an *annotation*. It\'s metadata that tells the FTC app "this is a driver-controlled program". An `@Autonomous` annotation does the same for autonomous programs.',
          '<b><code>public class ... extends LinearOpMode</code>:</b> This declares your class. By *extending* `LinearOpMode`, your class inherits all the basic FTC functionality, like `telemetry`, `hardwareMap`, and `gamepad1`.',
          '<b><code>waitForStart()</code>:</b> This is a critical line! It pauses your code. Code *before* this runs when you press **INIT**. The code *after* it only runs after the driver presses **PLAY**.',
          '<b><code>while (opModeIsActive())</code>:</b> This is the main run loop. `opModeIsActive()` is a method that returns `true` after PLAY is pressed and becomes `false` when STOP is pressed, ending the loop.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the purpose of the `@TeleOp` annotation?',
        options: ['To start the robot moving.', 'To connect to the Wi-Fi.', 'To register the OpMode on the Driver Hub list.', 'To declare a new variable.'],
        correctAnswer: 'To register the OpMode on the Driver Hub list.',
        explanation: 'The `@TeleOp(...)` annotation tells the FTC app that this class is a runnable OpMode and defines the name and group that will appear on the selection screen.',
      },
      {
        question: 'Code placed BEFORE `waitForStart()` runs when you press...',
        options: ['PLAY', 'STOP', 'It doesn\'t run.', 'INIT'],
        correctAnswer: 'INIT',
        explanation: 'The section before `waitForStart()` is for initialization. It runs as soon as you select the OpMode and press the INIT button on the Driver Hub. This is where you map hardware.',
      },
      {
        question: 'What does the `while (opModeIsActive())` loop do?',
        options: ['Creates a loop that repeats until STOP is pressed.', 'Handles all hardware initialization.', 'Runs the code inside it a single time.', 'Checks the OpMode for syntax errors.'],
        correctAnswer: 'Creates a loop that repeats until STOP is pressed.',
        explanation: 'This is the main run loop. `opModeIsActive()` is `true` after PLAY is pressed and becomes `false` when STOP is pressed, ending the loop.',
      },
    ],
  },
  {
    id: 'lesson2',
    type: 'lesson',
    title: '2. Hardware Mapping',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'To control your robot, your code needs to be linked to its physical parts. This is done through the `hardwareMap`, which is the bridge between your software objects and your physical hardware.',
      },
      { type: LessonContentType.Heading, text: 'The Hardware Configuration' },
      {
        type: LessonContentType.Paragraph,
        text: 'On the Robot Controller app (or Control Hub), you create a configuration file where you define every motor, servo, and sensor connected to your hubs. You give each device a unique name (e.g., `"left_drive"`, `"arm_motor"`, `"claw_servo"`).',
      },
      { type: LessonContentType.Heading, text: 'Using the `hardwareMap` Object' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `hardwareMap` object is provided by the FTC SDK inside your OpMode. You use its `get()` method to retrieve a reference to a specific configured device. It is **critical** that the text name you use in the code **exactly matches** the name from your configuration file, including capitalization and underscores.',
      },
      {
        type: LessonContentType.Code,
        code: `// At the top of your OpMode class, declare variables for your hardware.
// It's good practice to declare them as 'private' and initialize to 'null'.
private DcMotor leftDrive = null;
private DcMotor rightDrive = null;
private Servo clawServo = null;

@Override
public void runOpMode() {
    // In the INIT section, before waitForStart(), map the hardware.
    
    // The first parameter is the class of the device (e.g., DcMotor.class).
    // The second parameter is the name from your configuration file.
    leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
    rightDrive = hardwareMap.get(DcMotor.class, "right_drive");
    clawServo = hardwareMap.get(Servo.class, "claw_servo");

    // After this, the variables 'leftDrive', 'rightDrive', and 'clawServo'
    // are linked to the physical hardware and can be commanded.

    // ... rest of your initialization
}`,
      },
      { type: LessonContentType.Heading, text: 'Common Error: `HardwareDeviceNotFoundException`' },
      {
        type: LessonContentType.Paragraph,
        text: 'If the name in your code doesn\'t match the configuration, your program will crash when you press INIT, and the Driver Hub will show a `HardwareDeviceNotFoundException` error. This is one of the most common errors for beginners, so always double-check your names!',
      }
    ],
    quiz: [
      {
        question: 'What is the purpose of `hardwareMap.get()`?',
        options: ['Gets the robot\'s current battery voltage.', 'Begins the robot\'s movement.', 'Sets the power level for all motors.', 'Links a code variable to a physical device.'],
        correctAnswer: 'Links a code variable to a physical device.',
        explanation: 'The `hardwareMap.get()` method takes the device type (e.g., `DcMotor.class`) and its configured name to link your code variable to the physical device.',
      },
      {
        question: 'What happens if the name in `hardwareMap.get(DcMotor.class, "motor_A")` is `"motor_a"` in the robot configuration?',
        options: ['The code will crash when you press INIT.', 'Nothing, it is case-insensitive.', 'The app will ask you to rename it.', 'The motor runs at half speed.'],
        correctAnswer: 'The code will crash when you press INIT.',
        explanation: 'The names are case-sensitive and must match exactly. `"motor_A"` is not the same as `"motor_a"`. This would cause a `HardwareDeviceNotFoundException`.',
      },
      {
        question: 'Where should you typically map your hardware?',
        options: ['In the section after `waitForStart()`.', 'In the INIT phase, before `waitForStart()`.', 'In a separate, unused file.', 'Inside the main `while` loop.'],
        correctAnswer: 'In the INIT phase, before `waitForStart()`.',
        explanation: 'Hardware mapping is a setup task that only needs to be done once at the beginning of the program, so it belongs in the INIT phase.',
      },
    ],
  },
  {
    id: 'lesson3',
    type: 'lesson',
    title: '3. Controlling Motors & Servos',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Actuators are the parts of the robot that create motion. The two most common actuators in FTC are DC motors and servos.',
      },
      { type: LessonContentType.Heading, text: 'Controlling DC Motors' },
      {
        type: LessonContentType.Paragraph,
        text: 'Motors provide continuous rotation. You control their speed and direction by setting a **power** level from **-1.0** (full power reverse) to **+1.0** (full power forward). A value of **0** is stop.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'A critical step is setting the motor direction. Since motors on opposite sides of a drivetrain are physically mirrored, one side must be reversed in software for the robot to drive straight.',
      },
      {
        type: LessonContentType.Code,
        code: `// In your initialization after mapping the motors
leftDrive.setDirection(DcMotor.Direction.FORWARD);
rightDrive.setDirection(DcMotor.Direction.REVERSE); // This motor is mounted backwards

// ... in your run loop ...
double drivePower = 0.5; // 50% power forward
leftDrive.setPower(drivePower);
rightDrive.setPower(drivePower);`,
      },
      { type: LessonContentType.Heading, text: 'Controlling Servos' },
      {
        type: LessonContentType.Paragraph,
        text: 'Standard servos do not rotate continuously. They move to a specific angular **position** and hold it. This position is commanded with a value from **0.0** to **1.0**, which represents the servo\'s full range of motion (typically 180 or 270 degrees).',
      },
      {
        type: LessonContentType.Code,
        code: `// Assume you have a 'clawServo' mapped
// It's excellent practice to define constants for your key positions
static final double CLAW_OPEN_POS = 0.8;
static final double CLAW_CLOSED_POS = 0.3;

// In your run loop
if (gamepad1.a) {
    clawServo.setPosition(CLAW_OPEN_POS);
} else if (gamepad1.b) {
    clawServo.setPosition(CLAW_CLOSED_POS);
}`,
      },
       { type: LessonContentType.Heading, text: 'Continuous Rotation (CR) Servos' },
       {
        type: LessonContentType.Paragraph,
        text: 'CR Servos are a hybrid. They are packaged like a servo but controlled like a weak DC motor. You use `.setPower()` on them, just like a motor, with 1.0 being full speed one way, -1.0 full speed the other, and 0.5 being stop (the stop point can vary and may need tuning).',
      },
    ],
    quiz: [
      {
        question: 'What is the valid range for motor power values passed to `.setPower()`?',
        options: ['0 to 100', '-1.0 to 1.0', '0.0 to 1.0', '-100 to 100'],
        correctAnswer: '-1.0 to 1.0',
        explanation: 'Motor power is represented as a decimal from -1.0 (full reverse) to 1.0 (full forward), with 0 indicating the motor should stop.',
      },
      {
        question: 'If you want your robot to drive forward, and the motors on the right side are spinning the wrong way, what should you do?',
        options: ['Set their power to a negative value in the loop.', 'Physically remount the motors.', 'Replace the motors.', 'Set their direction to `REVERSE` during initialization.'],
        correctAnswer: 'Set their direction to `REVERSE` during initialization.',
        explanation: '`motor.setDirection(DcMotor.Direction.REVERSE)` is the standard way to account for the mirrored mounting of motors on a drivetrain.',
      },
      {
        question: 'What is the main difference between a DC motor and a standard servo?',
        options: ['Motors are generally more powerful.', 'Servos are more power-efficient.', 'Motors spin continuously; servos move to an angle.', 'Servos can spin much faster.'],
        correctAnswer: 'Motors spin continuously; servos move to an angle.',
        explanation: 'You set a "power" for a motor to make it spin, but you set a "position" for a servo to make it move to and hold a specific angle.',
      },
    ],
  },
  {
    id: 'lesson4',
    type: 'lesson',
    title: '4. Reading Gamepad Inputs',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'The drivers control the robot using gamepads. The FTC SDK provides two global objects, `gamepad1` and `gamepad2`, to read their inputs. You should check these inputs inside the main run loop of your TeleOp.',
      },
      { type: LessonContentType.Heading, text: 'Types of Gamepad Inputs' },
      {
        type: LessonContentType.List,
        items: [
          '<b>Joysticks:</b> Return a `double` from -1.0 to 1.0. Examples: `gamepad1.left_stick_y`, `gamepad1.right_stick_x`. Note that the Y-axis is inverted (up is negative).',
          '<b>Buttons:</b> Return a `boolean` (`true` if pressed, `false` otherwise). Examples: `gamepad1.a`, `gamepad1.x`, `gamepad1.left_bumper`.',
          '<b>Triggers:</b> Return a `double` from 0.0 (not pressed) to 1.0 (fully pressed). Examples: `gamepad1.left_trigger`, `gamepad1.right_trigger`.',
        ],
      },
      { type: LessonContentType.Heading, text: 'Simple Tank Drive Example' },
      {
        type: LessonContentType.Paragraph,
        text: 'Tank drive is a common control scheme where each joystick controls one side of the robot\'s drivetrain.',
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop

// The Y-axis on a gamepad is inverted; "up" is a negative value.
// So we multiply by -1 to make pushing the stick forward result in positive power.
double leftPower = -gamepad1.left_stick_y;
double rightPower = -gamepad1.right_stick_y;

// Send calculated power to the motors
leftDrive.setPower(leftPower);
rightDrive.setPower(rightPower);

// Show the power values on the Driver Hub for debugging
telemetry.addData("Left Power", leftPower);
telemetry.addData("Right Power", rightPower);
telemetry.update();`,
      },
      { type: LessonContentType.Heading, text: 'Advanced: Edge Detection (Toggle)'},
      {
        type: LessonContentType.Paragraph,
        text: 'A common task is to make a button toggle a mechanism (e.g., press once to open claw, press again to close). A simple `if (gamepad1.a)` won\'t work, as it will be true for the entire time the button is held down. You need to detect the "edge" - the moment the button *becomes* pressed.'
      },
      {
        type: LessonContentType.Code,
        code: `// At the top of your OpMode, add two state variables
boolean clawIsOpen = true;
boolean aButtonWasPressed = false;

// ... inside your while(opModeIsActive()) loop ...

// Check if the 'a' button is pressed right now, AND it wasn't pressed on the last loop.
if (gamepad1.a && !aButtonWasPressed) {
    // This is a "rising edge" - the button was just pressed!
    clawIsOpen = !clawIsOpen; // Toggle the state
}

// Update the 'was pressed' variable for the next loop iteration.
aButtonWasPressed = gamepad1.a;

// Now, set the servo position based on the state variable
if (clawIsOpen) {
    clawServo.setPosition(CLAW_OPEN_POSITION);
} else {
    clawServo.setPosition(CLAW_CLOSED_POSITION);
}`
      }
    ],
    quiz: [
      {
        question: 'In the code `double y = -gamepad1.left_stick_y;`, why is the value often negated (multiplied by -1)?',
        options: ['To make the motor spin in reverse.', 'To convert the value to an integer.', 'To invert the stick\'s negative-up value.', 'It is a required part of Java syntax.'],
        correctAnswer: 'To invert the stick\'s negative-up value.',
        explanation: 'By convention for most controllers, pushing a joystick forward results in a negative Y value. We multiply by -1 so that pushing forward on the stick corresponds to positive motor power.',
      },
      {
        question: 'What data type does a button like `gamepad1.left_bumper` return?',
        options: ['boolean', 'double', 'String', 'int'],
        correctAnswer: 'boolean',
        explanation: 'Buttons are digital inputs; they are either pressed (`true`) or not pressed (`false`).',
      },
      {
        question: 'What is the value of `gamepad1.right_trigger` when it is being pressed down halfway?',
        options: ['-1.0', '1.0', 'true', 'Approximately 0.5'],
        correctAnswer: 'Approximately 0.5',
        explanation: 'Triggers are analog, ranging from 0.0 (not pressed) to 1.0 (fully pressed). Halfway down would give a value around 0.5.',
      },
    ],
  },
  {
    id: 'lesson5',
    type: 'lesson',
    title: '5. Using Sensors',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Sensors are the eyes and ears of your robot. They allow it to perceive its environment and react intelligently, which is the key to a robust autonomous program. We will cover three common types: Touch, Distance, and Color.',
      },
      { type: LessonContentType.Heading, text: 'Touch Sensor (Digital)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A touch sensor is a simple digital button. It tells you if it is currently being pressed (`true`) or not (`false`). They are excellent as limit switches to prevent a mechanism from moving too far.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
TouchSensor limitSwitch = hardwareMap.get(TouchSensor.class, "limit_switch");

// In the loop, controlling an arm motor
if (gamepad1.y && !limitSwitch.isPressed()) {
    // Only allow the arm to move up if the limit switch is NOT pressed
    armMotor.setPower(0.5);
} else {
    armMotor.setPower(0);
}`
      },
      { type: LessonContentType.Heading, text: 'Distance Sensor (Analog)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A distance sensor measures how far away an object is. It returns a `double` value in a specific unit that you request, like centimeters or inches. This is useful for stopping before hitting a wall.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
DistanceSensor distanceSensor = hardwareMap.get(DistanceSensor.class, "distance_sensor");

// In the loop
double distance = distanceSensor.getDistance(DistanceUnit.INCH);
telemetry.addData("Distance (inch)", distance);

if (distance < 10) {
    // If we are closer than 10 inches, stop the robot
    drivetrain.stop();
}`
      },
      { type: LessonContentType.Heading, text: 'Color Sensor (Analog)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A color sensor detects the color of the surface below it by measuring the amount of Red, Green, and Blue (RGB) light reflected. You can use these values to find a line on the floor.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
ColorSensor colorSensor = hardwareMap.get(ColorSensor.class, "color_sensor");

// In the loop
int redValue = colorSensor.red();
int greenValue = colorSensor.green();
int blueValue = colorSensor.blue();

// A simple way to check for a blue line is to see if the blue value
// is significantly larger than the red value.
boolean onBlueLine = blueValue > (redValue * 1.5);

if (onBlueLine) {
    telemetry.addData("Status", "On the blue line!");
}
telemetry.update();`
      }
    ],
    quiz: [
      {
        question: 'What is a good use for a touch sensor on a linear slide?',
        options: ['Acts as a limit switch for mechanism endpoints.', 'Detects the color of the slide.', 'Measures the speed of the slide.', 'Measures distance to a nearby wall.'],
        correctAnswer: 'Acts as a limit switch for mechanism endpoints.',
        explanation: 'A touch sensor placed at the end of a mechanism\'s travel can provide a definitive signal to stop the motor, preventing damage.'
      },
      {
        question: 'The method `distanceSensor.getDistance(DistanceUnit.CM)` returns what data type?',
        options: ['int', 'boolean', 'double', 'String'],
        correctAnswer: 'double',
        explanation: 'Distance is a continuous measurement, so it is represented by a `double` (a number that can have decimal points) in the specified units.'
      },
      {
        question: 'If a color sensor is over a pure white surface on the FTC field, what would you expect from the RGB values?',
        options: ['All values would be very low (near 0).', 'All values (Red, Green, Blue) would be very high.', 'The red value would be high, others low.', 'The blue value would be high, others low.'],
        correctAnswer: 'All values (Red, Green, Blue) would be very high.',
        explanation: 'A white surface reflects all colors of light, so the sensor\'s red, green, and blue detectors would all report high values.'
      }
    ]
  },
    {
    id: 'lesson6',
    type: 'lesson',
    title: '6. Introduction to Encoders',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'For precise and repeatable autonomous movement, you can\'t just rely on running motors for a certain amount of time. Battery levels change, and wheels can slip. You need **feedback** to know how far your motors have actually turned. This is what **encoders** provide.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'An encoder is a sensor built into or attached to a motor that reports its rotation. It counts "ticks" or "counts" as it spins. By knowing the ticks per revolution for your motor and your robot\'s physical dimensions, you can convert these ticks into real-world distances like inches.',
      },
      { type: LessonContentType.Heading, text: 'Encoder-Based Autonomous Driving' },
      {
        type: LessonContentType.Paragraph,
        text: 'The FTC SDK provides a special motor mode, `RUN_TO_POSITION`, that uses the motor controller\'s internal PID to drive to a specific target tick count and then stop. This is the foundation of most autonomous routines.'
      },
      {
        type: LessonContentType.Code,
        code: `// This entire block of code could be a method, like encoderDrive(speed, inches)

// 1. Reset the encoders. This sets their current position to 0.
leftDrive.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
rightDrive.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

// 2. Set the target position in ticks. (This would be calculated from inches).
int targetTicks = 1120; // Example: 1 full rotation on a Gobilda 5202 motor
leftDrive.setTargetPosition(targetTicks);
rightDrive.setTargetPosition(targetTicks);

// 3. Set the motors to RUN_TO_POSITION mode. This tells the motor controller
// to take over and drive to the target.
leftDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);
rightDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);

// 4. Set a power and the motors will start moving towards the target.
double speed = 0.6;
leftDrive.setPower(speed);
rightDrive.setPower(speed);

// 5. Loop while the motors are still busy. The isBusy() method returns true
// as long as the motor has not yet reached its target.
while (opModeIsActive() && leftDrive.isBusy() && rightDrive.isBusy()) {
    // We can add telemetry here to see what's happening
    telemetry.addData("Path", "Driving to %d ticks", targetTicks);
    telemetry.addData("Current Pos", "L:%d, R:%d", leftDrive.getCurrentPosition(), rightDrive.getCurrentPosition());
    telemetry.update();
}

// 6. The motors have reached their target. Stop them completely.
leftDrive.setPower(0);
rightDrive.setPower(0);

// Optional but good practice: Turn off RUN_TO_POSITION mode.
leftDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
rightDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
`
      }
    ],
    quiz: [
      {
        question: 'What is the main purpose of a motor encoder?',
        options: ['To make the motor spin faster.', 'To provide feedback on how far the motor has rotated.', 'To measure the motor\'s temperature.', 'To change the motor\'s direction.'],
        correctAnswer: 'To provide feedback on how far the motor has rotated.',
        explanation: 'Encoders are feedback devices that are essential for accurate and repeatable autonomous movements.'
      },
      {
        question: 'Which `RunMode` must you set the motor to before setting a new target with `setTargetPosition()`?',
        options: ['RUN_USING_ENCODER', 'STOP_AND_RESET_ENCODER', 'RUN_TO_POSITION', 'RUN_WITHOUT_ENCODER'],
        correctAnswer: 'RUN_TO_POSITION',
        explanation: 'The motor needs to be in `RUN_TO_POSITION` mode for the controller to actively use the encoder feedback to drive to the specified target. `STOP_AND_RESET_ENCODER` should be done before setting the target to ensure movement is relative.'
      },
      {
        question: 'What does the `isBusy()` method tell you when a motor is in `RUN_TO_POSITION` mode?',
        options: ['If the current OpMode is active.', 'If the motor is actively seeking its target.', 'If any gamepad buttons are pressed.', 'If the OpMode code has syntax errors.'],
        correctAnswer: 'If the motor is actively seeking its target.',
        explanation: '`isBusy()` returns `true` as long as the motor controller is actively trying to reach the target set with `setTargetPosition()`. It becomes `false` once the target is reached (within a small tolerance).',
      }
    ]
  },
  {
    id: 'lesson7',
    type: 'lesson',
    title: '7. Building a Hardware Class',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'As your robot gets more complex (more motors, more servos, more sensors), putting all your hardware declarations and initializations in every single OpMode becomes messy and hard to maintain. A much cleaner, more professional approach is to create a dedicated **Hardware Class**.'
      },
      { type: LessonContentType.Heading, text: 'What is a Hardware Class?' },
      {
        type: LessonContentType.Paragraph,
        text: 'A hardware class is a single Java class whose only job is to represent your physical robot. It declares all the hardware components as public variables and contains a single `init()` method to map them all from the `hardwareMap`. Your OpModes can then create an object of this class to get easy access to all the robot\'s hardware.'
      },
      { type: LessonContentType.Heading, text: 'Example: `HardwareRobot.java`' },
      {
        type: LessonContentType.Code,
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.Servo;

public class HardwareRobot {
    // Declare all your hardware components as public member variables.
    public DcMotor  leftDrive   = null;
    public DcMotor  rightDrive  = null;
    public DcMotor  armMotor    = null;
    public Servo    clawServo   = null;
    
    // The constructor can be left empty.
    public HardwareRobot() {}

    // The init method takes the hardwareMap from the OpMode and initializes everything.
    public void init(HardwareMap hwMap) {
        // Initialize all the hardware from the configuration
        leftDrive  = hwMap.get(DcMotor.class, "left_drive");
        rightDrive = hwMap.get(DcMotor.class, "right_drive");
        armMotor   = hwMap.get(DcMotor.class, "arm_motor");
        clawServo  = hwMap.get(Servo.class, "claw_servo");
        
        // Set motor directions
        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);
        
        // Set initial motor powers to zero
        leftDrive.setPower(0);
        rightDrive.setPower(0);
        armMotor.setPower(0);
        
        // Set motors to run with encoders
        leftDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
        rightDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
    }
}`
      },
      { type: LessonContentType.Heading, text: 'Using the Hardware Class in an OpMode' },
      {
        type: LessonContentType.Code,
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp
public class MyTeleOp extends LinearOpMode {
    
    // Create an instance of our hardware class. This one line gives us access to everything.
    HardwareRobot robot = new HardwareRobot();

    @Override
    public void runOpMode() {
        // Initialize the hardware by calling our new init method.
        // We pass along the hardwareMap that the OpMode provides.
        robot.init(hardwareMap);

        waitForStart();

        while (opModeIsActive()) {
            // Now, we access our hardware through the 'robot' object.
            double drive = -gamepad1.left_stick_y;
            robot.leftDrive.setPower(drive);
            robot.rightDrive.setPower(drive);
            
            if (gamepad1.a) {
                robot.clawServo.setPosition(0.8);
            }
        }
    }
}`
      }
    ],
    quiz: [
      {
        question: 'What is the main advantage of using a hardware class?',
        options: ['It increases the robot\'s maximum speed.', 'It centralizes hardware mapping to reduce duplicate code.', 'It is a requirement from the official game manual.', 'It reduces the memory usage of the OpMode.'],
        correctAnswer: 'It centralizes hardware mapping to reduce duplicate code.',
        explanation: 'By putting all hardware mapping in one class, you avoid duplicating code in every OpMode. If you change a motor name, you only have to update it in one place.'
      },
      {
        question: 'How does the OpMode get the `hardwareMap` to pass to the hardware class\'s `init` method?',
        options: ['The OpMode creates a new `hardwareMap`.', 'It\'s an inherited variable from `LinearOpMode`.', 'It is read from a file on the controller.', 'The hardware class does not use a `hardwareMap`.'],
        correctAnswer: 'It\'s an inherited variable from `LinearOpMode`.',
        explanation: 'When your OpMode class `extends LinearOpMode`, it inherits the `hardwareMap` variable, which is populated by the FTC SDK when you press INIT.'
      },
      {
        question: 'In the example, how do you access the left motor from within the OpMode?',
        options: ['`leftDrive.setPower()`', '`robot.leftDrive.setPower()`', '`HardwareRobot.leftDrive.setPower()`', '`init.leftDrive.setPower()`'],
        correctAnswer: '`robot.leftDrive.setPower()`',
        explanation: '`robot` is the name of the object (instance) we created from the `HardwareRobot` class, and `leftDrive` is a public member variable of that object, so we access it with `robot.leftDrive`.'
      }
    ]
  },
  {
    id: 'lesson8',
    type: 'lesson',
    title: '8. Simple Autonomous with State Machines',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'How do you program a robot to do a sequence of actions, like "drive forward, turn left, drop pixel, park"? A common but poor approach is to use `sleep()` commands. This is unreliable because it doesn\'t account for battery drain or wheel slip. A much better way is to use a **state machine**.'
      },
      { type: LessonContentType.Heading, text: 'What is a State Machine?' },
      {
        type: LessonContentType.Paragraph,
        text: 'A state machine is a programming concept where your program can only be in one "state" at a time. It performs the action for that state, and when that action is complete, it transitions to the next state. This is perfect for autonomous routines.'
      },
      {
        type: LessonContentType.Paragraph,
        text: 'We can use an `enum` to define our states. An `enum` is a special data type that lets us define a set of constant, named values, which makes the code very readable.'
      },
      {
        type: LessonContentType.Code,
        code: `// Define all possible states for our autonomous routine
enum State {
    DRIVE_TO_SPIKE_MARK,
    TURN_TO_BACKDROP,
    DRIVE_TO_BACKDROP,
    RELEASE_PIXEL,
    PARK,
    IDLE  // An 'idle' or 'stop' state is good practice
}`
      },
      { type: LessonContentType.Heading, text: 'Implementing the State Machine Logic' },
      {
        type: LessonContentType.Paragraph,
        text: 'In your OpMode loop, you create a variable to hold the current state. Then, you use a `switch` statement to execute the code for the current state. When an action is finished (e.g., a motor reaches its target encoder position), you change the state variable to the next one in the sequence.'
      },
      {
        type: LessonContentType.Code,
        code: `// In your OpMode, create a variable to hold the current state, starting with the first one.
State currentState = State.DRIVE_TO_SPIKE_MARK;

// ... inside your while(opModeIsActive()) loop ...
switch (currentState) {
    case DRIVE_TO_SPIKE_MARK:
        // Assume you have an encoderDrive method that starts the motors
        // and doesn't wait. We check if the motors are done here.
        if (!robot.leftDrive.isBusy()) {
            // The drive is finished. Transition to the next state.
            encoderTurn(TURN_SPEED, 90); // Start the turn
            currentState = State.TURN_TO_BACKDROP;
        }
        break; // IMPORTANT: end the case here

    case TURN_TO_BACKDROP:
        if (!robot.leftDrive.isBusy()) {
            // The turn is finished.
            encoderDrive(DRIVE_SPEED, 24); // Start driving to backdrop
            currentState = State.DRIVE_TO_BACKDROP;
        }
        break;

    // ... other states would follow the same pattern ...
    
    case PARK:
        // Transition to IDLE to stop the machine
        currentState = State.IDLE;
        break;
        
    case IDLE:
        // Do nothing. The routine is over.
        break;
}`
      }
    ],
    quiz: [
      {
        question: 'Why is a state machine better than using a series of `sleep()` commands for autonomous?',
        options: ['It uses significantly less memory.', 'It\'s more reliable as it waits for events, not just time.', 'It always executes the routine faster.', 'It makes the code look more complex.'],
        correctAnswer: 'It\'s more reliable as it waits for events, not just time.',
        explanation: 'A state machine is event-driven (waiting for motors to finish, sensors to trigger, etc.), which makes it robust against variations in battery voltage or field conditions. Time-based routines are very brittle.'
      },
      {
        question: 'What is the purpose of an `enum` in a state machine?',
        options: ['To perform complex math calculations.', 'Counts the total number of states.', 'Defines clear, named constants for each state.', 'Stores the values from robot sensors.'],
        correctAnswer: 'Defines clear, named constants for each state.',
        explanation: 'Using an `enum` like `State.DRIVE_TO_BACKDROP` makes the code much more readable and less error-prone than using magic numbers (e.g., `if (state == 2)`).'
      },
      {
        question: 'In a `switch` statement, what is the purpose of the `break;` keyword?',
        options: ['Stops the robot\'s current movement.', 'Exits the `switch` block to prevent "fall-through".', 'Pauses the program for one second.', 'Ends the OpMode immediately.'],
        correctAnswer: 'Exits the `switch` block to prevent "fall-through".',
        explanation: 'Without `break;`, the code will "fall through" and execute the code in the next case as well. This is a common bug, so always remember to `break;` at the end of each case block.'
      }
    ]
  },
  {
    id: 'lesson9',
    type: 'lesson',
    title: '9. Mecanum Drive',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Mecanum wheels are a popular choice in FTC because they allow for **holonomic** motion. This means the robot can move in any direction (forward, backward, sideways/strafing) and turn, all without needing to turn first. It gives the robot incredible agility on the field.'
      },
      { type: LessonContentType.Heading, text: 'The Physics of Mecanum Wheels' },
      {
        type: LessonContentType.Paragraph,
        text: 'Each wheel has rollers mounted at a 45-degree angle to the wheel\'s axis. When the wheel spins, it pushes force both forward/backward and side-to-side. By spinning the four wheels at different speeds and directions, you can control the net force vector on the robot, allowing it to move anywhere on the 2D plane.'
      },
      {
        type: LessonContentType.List,
        items: [
          '<b>To Drive Forward:</b> All wheels spin forward.',
          '<b>To Strafe Right:</b> Front-left and back-right spin forward; front-right and back-left spin backward.',
          '<b>To Turn Right:</b> Left-side wheels spin forward; right-side wheels spin backward.',
        ],
      },
      { type: LessonContentType.Heading, text: 'Mecanum Drive Control Logic' },
      {
        type: LessonContentType.Paragraph,
        text: 'The core of mecanum drive control is a set of equations that mix the driver\'s three inputs (forward/backward, strafe left/right, turn left/right) into four unique power values for each motor. It\'s important to get the motor directions and the math correct.'
      },
      {
        type: LessonContentType.Code,
        code: `// Assuming a standard mecanum setup with four motors:
// frontLeft, backLeft, frontRight, backRight

// In the loop:
double y = -gamepad1.left_stick_y;  // Forward/Backward. Negated for intuitive control.
double x = gamepad1.left_stick_x * 1.1; // Strafe Left/Right. Multiplied by 1.1 to counteract friction.
double rx = gamepad1.right_stick_x; // Turn Left/Right

// Denominator is the largest possible sum of wheel powers
double denominator = Math.max(Math.abs(y) + Math.abs(x) + Math.abs(rx), 1);

// The math to calculate wheel powers
double frontLeftPower  = (y + x + rx) / denominator;
double backLeftPower   = (y - x + rx) / denominator;
double frontRightPower = (y - x - rx) / denominator;
double backRightPower  = (y + x - rx) / denominator;

// Set the power on the motors
frontLeftMotor.setPower(frontLeftPower);
backLeftMotor.setPower(backLeftPower);
frontRightMotor.setPower(frontRightPower);
backRightMotor.setPower(backRightPower);
`
      },
      {
        type: LessonContentType.Paragraph,
        text: 'The normalization logic (dividing by `denominator`) is a more robust way to prevent wheel powers from exceeding 1.0. It ensures that the ratio of motor speeds is always correct, even at the extremes of joystick movement.'
      }
    ],
    quiz: [
      {
        question: 'What is "holonomic motion" in the context of a mecanum drivetrain?',
        options: ['The robot is faster than a tank drive.', 'The ability to move in any direction and rotate simultaneously.', 'The robot uses fewer motors.', 'The robot is easier to build.'],
        correctAnswer: 'The ability to move in any direction and rotate simultaneously.',
        explanation: 'Holonomic means the robot has 3 degrees of freedom (X, Y, and rotation) on a 2D plane, giving it superior agility.'
      },
      {
        question: 'In the provided code, what is the purpose of the `denominator` variable?',
        options: ['Adds unnecessary complexity to the math.', 'Normalizes wheel powers to maintain movement ratios.', 'Slows down the robot\'s overall speed.', 'Calculates the robot\'s current speed.'],
        correctAnswer: 'Normalizes wheel powers to maintain movement ratios.',
        explanation: 'Without normalization, commanding a diagonal movement could result in calculated powers greater than 1.0, which would be clipped and distort the robot\'s movement. The denominator scales everything down proportionally.'
      },
      {
        question: 'If your robot is trying to strafe right but is instead moving forward and turning, what is the most likely problem?',
        options: ['The robot\'s battery is low.', 'A motor has an incorrect direction or port assignment.', 'The driver\'s gamepad is broken.', 'The playing surface is too slippery.'],
        correctAnswer: 'A motor has an incorrect direction or port assignment.',
        explanation: 'Mecanum drive is very sensitive to correct motor directions and port assignments. Incorrect behavior is almost always a result of a misconfiguration in either the physical wiring or the software directions.'
      }
    ]
  },
  {
    id: 'lesson10',
    type: 'lesson',
    title: '10. Introduction to PID Control',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'PID is a powerful and ubiquitous control loop algorithm used to get a system to a target state and keep it there. It stands for **Proportional, Integral, Derivative**. In FTC, it\'s used for everything from precisely holding an arm against gravity to making a robot turn to an exact angle. The `RUN_TO_POSITION` motor mode uses a PID controller internally!'
      },
      { type: LessonContentType.Heading, text: 'The Core Concepts' },
      {
        type: LessonContentType.List,
        items: [
          '<b>Error:</b> The fundamental concept. `Error = Target - CurrentPosition`. The goal of PID is to make this error zero.',
          '<b>Proportional (P):</b> This is the main driving force. The further you are from your target, the more power you apply. `Power_P = Error * kP`. A high `kP` makes it fast and aggressive, but can cause it to overshoot.',
          '<b>Integral (I):</b> This corrects for small, steady-state errors that the P term alone can\'t fix (like an arm sagging due to gravity). It accumulates the error over time, so if a small error persists, the Integral term will slowly grow and add corrective power. `Power_I = accumulatedError * kI`.',
          '<b>Derivative (D):</b> This is the brakes. It looks at how fast the error is changing. If you are approaching the target very quickly, the D term will apply a counter-force to slow you down and prevent overshooting. `Power_D = (error - lastError) * kD`.',
          '<b>Final Power</b> = `Power_P + Power_I + Power_D`',
        ]
      },
      { type: LessonContentType.Heading, text: 'Simple P-Controller for an Arm' },
      {
        type: LessonContentType.Paragraph,
        text: 'A full PIDF controller (where F is Feedforward, for counteracting gravity) is complex to tune. However, a simple P-controller is very easy to implement and can be surprisingly effective for holding a robot arm at a specific encoder position.'
      },
      {
        type: LessonContentType.Code,
        code: `// Constants you need to "tune" or find through testing
// kP is the proportional gain. Start small (e.g., 0.005) and increase it.
public static double kP = 0.005; 
int armTargetPosition = 500; // The target encoder position for the arm

// You must use a motor mode that allows manual power control
armMotor.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);

// Inside the while(opModeIsActive()) loop
int currentPosition = armMotor.getCurrentPosition();
int error = armTargetPosition - currentPosition;

double power = error * kP;

// Limit the power to the valid -1.0 to 1.0 range
// The Range.clip method is very useful for this.
power = Range.clip(power, -1.0, 1.0);

armMotor.setPower(power);

telemetry.addData("Target", armTargetPosition);
telemetry.addData("Current", currentPosition);
telemetry.addData("Error", error);
telemetry.addData("Power", power);
telemetry.update();
`
      }
    ],
    quiz: [
      {
        question: 'What is the "error" in a PID controller?',
        options: ['The difference between the target position and the current position.', 'A mistake in the code.', 'The amount of power being used.', 'The time elapsed.'],
        correctAnswer: 'The difference between the target position and the current position.',
        explanation: 'The entire PID algorithm is based on calculating the error and applying a corrective output to drive that error to zero.'
      },
      {
        question: 'In a P-controller for an arm, if you increase the `kP` value too much, what is likely to happen?',
        options: ['The arm will move very slowly.', 'The battery will drain much faster.', 'The arm will oscillate around the target.', 'The arm will fail to move at all.'],
        correctAnswer: 'The arm will oscillate around the target.',
        explanation: 'A high `kP` gain makes the controller very aggressive. It will overshoot the target, then overcorrect in the other direction, leading to oscillation.'
      },
      {
        question: 'What real-world problem does the Integral (I) term solve for a robot arm?',
        options: ['It corrects for persistent errors like gravity sag.', 'It prevents the arm from overshooting.', 'It resets the arm motor\'s encoders.', 'It increases the arm\'s speed.'],
        correctAnswer: 'It corrects for persistent errors like gravity sag.',
        explanation: 'Gravity creates a small, constant error. The Proportional term alone might not be enough to overcome it. The Integral term accumulates this small error over time until it builds up enough corrective power to eliminate the sag.'
      }
    ]
  },
  // =================================================================
  // INTERMEDIATE SECTION
  // =================================================================
  {
    id: 'lesson11',
    type: 'lesson',
    title: '11. The IMU & Field-Centric Drive',
    content: [
       {
        type: LessonContentType.SectionBreak,
        text: 'Intermediate',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'The **Inertial Measurement Unit (IMU)** is a powerful sensor built into the Control Hub and Expansion Hub. It measures the robot\'s orientation in 3D space. Its most common and important use is to get an accurate heading (angle) for the robot, which enables **field-centric drive**.'
      },
      { type: LessonContentType.Heading, text: 'Initializing the IMU' },
      {
        type: LessonContentType.Paragraph,
        text: 'You initialize the IMU just like any other hardware component. A critical step is telling the IMU how the hub is physically mounted on your robot. This ensures that a "yaw" of 0 degrees is truly "forward" for your robot.'
      },
      {
        type: LessonContentType.Code,
        code: `// Declare the IMU object at the top of your class
private IMU imu;

// In your initialization section (before waitForStart)
// Retrieve the IMU from the hardware map. The name is usually "imu"
imu = hardwareMap.get(IMU.class, "imu");

// Define the IMU parameters. This tells the IMU how the Hub is mounted on your robot.
// You must change these values to match your robot's configuration!
IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
    RevHubOrientationOnRobot.LogoFacingDirection.UP,
    RevHubOrientationOnRobot.UsbFacingDirection.FORWARD));

// Initialize the IMU with the parameters
imu.initialize(parameters);`
      },
      { type: LessonContentType.Heading, text: 'Robot-Centric vs. Field-Centric' },
      {
        type: LessonContentType.Paragraph,
        text: 'With normal mecanum control, "forward" on the joystick is always "forward" from the robot\'s perspective. This is **robot-centric**. If the robot turns 90 degrees, pushing forward on the stick now drives it sideways relative to the field. This can be confusing for drivers.'
      },
      {
        type: LessonContentType.Paragraph,
        text: '**Field-centric** drive uses the IMU. "Forward" on the joystick is *always* "forward" relative to the field (e.g., towards the opposing alliance wall), no matter which way the robot itself is facing. The drive inputs from the joystick are mathematically rotated by the robot\'s current angle before being sent to the mecanum drive equations.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the loop of your TeleOp
double y = -gamepad1.left_stick_y;
double x = gamepad1.left_stick_x;
double rx = gamepad1.right_stick_x;

// Get the robot's current heading in radians
double botHeading = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.RADIANS);

// Rotate the drive inputs by the negative of the robot's heading
double rotX = x * Math.cos(-botHeading) - y * Math.sin(-botHeading);
double rotY = x * Math.sin(-botHeading) + y * Math.cos(-botHeading);

// Denominator is the largest possible sum of wheel powers
double denominator = Math.max(Math.abs(rotY) + Math.abs(rotX) + Math.abs(rx), 1);
double frontLeftPower = (rotY + rotX + rx) / denominator;
// ... and so on for the other 3 wheels ...
`
      }
    ],
    quiz: [
      {
        question: 'What is the primary purpose of the IMU in a TeleOp program?',
        options: ['To measure distance to a wall', 'To provide the robot\'s current heading, enabling features like field-centric drive.', 'To detect what color the floor is', 'To control motor speed'],
        correctAnswer: 'To provide the robot\'s current heading, enabling features like field-centric drive.',
        explanation: 'The IMU provides the angle data needed to mathematically adjust joystick inputs so that the robot\'s movement is relative to the field, not its own front.'
      },
      {
        question: 'If your robot is using field-centric drive and you push the left stick straight forward, what happens?',
        options: ['The robot drives toward its own front.', 'The robot drives "forward" on the field.', 'The robot drives towards the audience.', 'The robot spins in place.'],
        correctAnswer: 'The robot drives "forward" on the field.',
        explanation: 'Field-centric drive makes "forward" on the joystick always correspond to a single direction on the field, making it much more intuitive to drive.'
      },
      {
        question: 'What does the method `imu.resetYaw()` do?',
        options: ['It defines the current heading as the new zero.', 'It reboots the IMU sensor.', 'It reads the current yaw angle.', 'It re-initializes the IMU.'],
        correctAnswer: 'It defines the current heading as the new zero.',
        explanation: '`resetYaw()` sets the current yaw angle to be the new zero point. This is very useful to do at the beginning of an OpMode or even with a button press during the match to re-orient the field-centric controls if needed.'
      }
    ]
  },
   {
    id: 'lesson12',
    type: 'lesson',
    title: '12. Advanced State Machines',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Our simple state machine is a great start, but it can be brittle. What if a motor gets stuck and `isBusy()` never becomes false? The robot will be stuck in that state forever. We can make our state machine more **robust** by adding **timeouts** using the `ElapsedTime` class.'
      },
      { type: LessonContentType.Heading, text: 'The `ElapsedTime` Timer' },
      {
        type: LessonContentType.Paragraph,
        text: '`ElapsedTime` is a simple and versatile stopwatch provided by the SDK. You can create a timer object, `reset()` it when a state begins, and then check how much time has passed using `.seconds()` or `.milliseconds()`. This is essential for building reliable autonomous routines.'
      },
      {
        type: LessonContentType.Code,
        code: `// Declare a timer at the top of your class
private ElapsedTime runtime = new ElapsedTime();
private State currentState = State.IDLE;

// It's good practice to wrap the state transition logic in a method.
private void enterNewState(State newState) {
    currentState = newState;
    runtime.reset(); // Reset the timer every time we enter a new state.
    // ... any other setup for the new state ...
}`
      },
      { type: LessonContentType.Heading, text: 'State Machine with Timeouts' },
      {
        type: LessonContentType.Paragraph,
        text: 'Now, we can add a second condition to our state transitions. We move to the next state if the action is complete (e.g., `!isBusy()`) **OR** if a certain amount of time has passed. This acts as a failsafe, preventing the robot from getting stuck.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside your state machine switch statement
case DRIVE_FORWARD:
    // We can also start the action here if we haven't already
    
    // Move to next state if finished OR if 5 seconds have passed
    boolean isFinished = !leftDrive.isBusy() && !rightDrive.isBusy();
    boolean isTimedOut = runtime.seconds() > 5.0;

    if (isFinished || isTimedOut) {
        // It's done or timed out, so move to the next state
        enterNewState(State.TURN_LEFT);
        // Start the turn action here...
    }
    break;

case TURN_LEFT:
    // Same logic with a 3 second timeout
    if (!leftDrive.isBusy() || runtime.seconds() > 3.0) {
        enterNewState(State.STOP);
    }
    break;
`
      }
    ],
    quiz: [
      {
        question: 'What is the main problem with a simple state machine that only checks `isBusy()`?',
        options: ['It is too difficult to program.', 'It executes too slowly on the hub.', 'It can get stuck if a condition is never met.', 'It consumes too much battery power.'],
        correctAnswer: 'It can get stuck if a condition is never met.',
        explanation: 'A simple state machine might never receive the signal to transition if a motor is blocked or a sensor fails. Timeouts add robustness by ensuring the program always moves on.'
      },
      {
        question: 'Which `ElapsedTime` method do you call to start the timer over from zero?',
        options: ['`reset()`', '`getTime()`', '`start()`', '`seconds()`'],
        correctAnswer: '`reset()`',
        explanation: '`runtime.reset()` sets the timer\'s internal start time to the current time, effectively restarting its count from zero.'
      },
      {
        question: 'What does the logical OR (`||`) do in the condition `if (isFinished || isTimedOut)`?',
        options: ['Transitions if the action finishes OR times out.', 'Requires both conditions to be true.', 'Checks if the robot path is an OR shape.', 'Causes a fatal program error.'],
        correctAnswer: 'Transitions if the action finishes OR times out.',
        explanation: 'The logical OR operator is the key to the failsafe. The state will end if the robot successfully completes its task OR if it takes too long, whichever happens first.'
      }
    ]
  },
  // =================================================================
  // ADVANCED SECTION
  // =================================================================
  {
    id: 'lesson13',
    type: 'lesson',
    title: '13. Introduction to AprilTags',
    content: [
      {
        type: LessonContentType.SectionBreak,
        text: 'Advanced',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Computer vision is a huge part of modern robotics. In recent FTC games, the primary vision target has been **AprilTags**. These are like advanced QR codes for robots. By detecting these tags on the field with a camera, the robot can determine its exact position and orientation relative to the tag.'
      },
      { type: LessonContentType.Heading, text: 'Setting up the AprilTag Processor' },
      {
        type: LessonContentType.Paragraph,
        text: 'The FTC SDK has a powerful, built-in system for vision processing. You create a `VisionPortal` and attach an `AprilTagProcessor` to it. This handles all the complex image analysis for you.'
      },
      {
        type: LessonContentType.Code,
        code: `private AprilTagProcessor aprilTag;
private VisionPortal visionPortal;

// In your initialization section
aprilTag = new AprilTagProcessor.Builder()
    // You can add settings here, like lens intrinsics for your specific camera
    .build();

visionPortal = new VisionPortal.Builder()
    .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
    .addProcessor(aprilTag)
    .build();
`
      },
      { type: LessonContentType.Heading, text: 'Using Detection Data' },
      {
        type: LessonContentType.Paragraph,
        text: 'In your loop, you can get a list of all the AprilTags the camera currently sees. Each `AprilTagDetection` object provides a wealth of information, including the tag\'s ID and its 3D pose (position and orientation) relative to the camera.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop
List<AprilTagDetection> currentDetections = aprilTag.getDetections();

telemetry.addData("# AprilTags Detected", currentDetections.size());

// Loop through all the detections
for (AprilTagDetection detection : currentDetections) {
    // Check if the detection has known metadata (is part of the official field tag family)
    if (detection.metadata != null) {
        telemetry.addLine(String.format("Found Tag ID %d, named %s", detection.id, detection.metadata.name));
        telemetry.addLine(String.format("Range: %.2f inches", detection.ftcPose.range));
        telemetry.addLine(String.format("Bearing: %.2f degrees", detection.ftcPose.bearing)); // Angle left/right
        telemetry.addLine(String.format("Yaw: %.2f degrees", detection.ftcPose.yaw)); // Rotational difference
    }
}
telemetry.update();
`
      }
    ],
    quiz: [
      {
        question: 'What is an AprilTag?',
        options: ['A specialized type of motor.', 'A visual marker for robot localization.', 'A tag that displays the date.', 'A brand new type of sensor.'],
        correctAnswer: 'A visual marker for robot localization.',
        explanation: 'AprilTags are visual markers that are easy for computers to recognize. The FTC software can calculate a 6-DoF (3D position and 3D orientation) pose from a single image of a tag.'
      },
      {
        question: 'What hardware is required to detect AprilTags?',
        options: ['A webcam or phone camera', 'An IMU', 'A touch sensor', 'A distance sensor'],
        correctAnswer: 'A webcam or phone camera',
        explanation: 'AprilTag detection is a computer vision task, which requires a camera to see the tags.'
      },
      {
        question: 'If `detection.ftcPose.range` gives you a value, what does that value represent?',
        options: ['The ID number of the tag', 'The color of the tag', 'The size of the tag', 'How far away the tag is from the camera\'s center'],
        correctAnswer: 'How far away the tag is from the camera\'s center',
        explanation: 'The `ftcPose` object contains useful information about the tag\'s position relative to the camera, including range (distance), bearing (angle left/right), and yaw (rotational difference).'
      }
    ]
  },
  {
    id: 'lesson14',
    type: 'lesson',
    title: '14. Advanced Vision: Tensorflow',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'While AprilTags are great for localization, sometimes you need to identify game-specific objects, like a decorated Team Prop. For this, FTC provides a **TensorFlow Object Detection (TFOD)** processor. You can train your own machine learning model to recognize specific objects.'
      },
      { type: LessonContentType.Heading, text: 'Setting up the TFOD Processor' },
      {
        type: LessonContentType.Paragraph,
        text: 'Similar to AprilTags, you add a `TfodProcessor` to your `VisionPortal`. The key difference is that you must provide a `.tflite` model file, which you place in the `assets` folder of your FTC project.'
      },
      {
        type: LessonContentType.Code,
        code: `private static final String TFOD_MODEL_ASSET = "MyCustomModel.tflite";
private static final String[] LABELS = { "BlueProp", "RedProp" };

private TfodProcessor tfod;
private VisionPortal visionPortal;

// In initialization
tfod = new TfodProcessor.Builder()
    .setModelAssetName(TFOD_MODEL_ASSET)
    .setModelLabels(LABELS)
    .build();

visionPortal = new VisionPortal.Builder()
    .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
    .addProcessor(tfod)
    .build();`
      },
      { type: LessonContentType.Heading, text: 'Using TFOD Detections' },
      {
        type: LessonContentType.Paragraph,
        text: 'In your loop, you can get a list of recognized objects. This is powerful for autonomous routines where the robot needs to determine where the Team Prop is (e.g., left, middle, or right spike mark) before performing an action.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the loop
List<Recognition> recognitions = tfod.getRecognitions();

// Default to one position
SpikeMarkPosition detectedPosition = SpikeMarkPosition.LEFT;

for (Recognition recognition : recognitions) {
    String label = recognition.getLabel();
    float confidence = recognition.getConfidence();

    // Get the horizontal center of the detected object
    double x = (recognition.getLeft() + recognition.getRight()) / 2;

    telemetry.addData(label, "Conf: %.2f", confidence);

    if (x < 200) { // Example pixel value for the middle zone
        detectedPosition = SpikeMarkPosition.MIDDLE;
    } else {
        detectedPosition = SpikeMarkPosition.RIGHT;
    }
}
telemetry.addData("Detected Position", detectedPosition);
telemetry.update();

// Now you can use 'detectedPosition' in your state machine!`
      }
    ],
    quiz: [
      {
        question: 'What is TensorFlow Object Detection (TFOD) used for in FTC?',
        options: ['Recognizes objects with a machine learning model.', 'Measures distance to an object.', 'Determines the robot\'s angle.', 'Controls motor speed and direction.'],
        correctAnswer: 'Recognizes objects with a machine learning model.',
        explanation: 'TFOD allows teams to go beyond standard markers like AprilTags and train a model to identify unique game elements, which is often necessary for autonomous tasks.'
      },
      {
        question: 'Where must you place your custom `.tflite` model file for the SDK to find it?',
        options: ['On a USB drive', 'In the root of the project', 'In a folder named `models`', 'In the `FIRST/assets` folder on the robot controller'],
        correctAnswer: 'In the `FIRST/assets` folder on the robot controller',
        explanation: 'The FTC SDK is specifically configured to look for TFOD models and other assets in the `/FIRST/assets/` directory on the controller\'s internal storage.'
      },
      {
        question: 'What does `recognition.getConfidence()` tell you?',
        options: ['The model\'s certainty of the identification.', 'The distance to the recognized object.', 'The size of the object in pixels.', 'The primary color of the object.'],
        correctAnswer: 'The model\'s certainty of the identification.',
        explanation: 'Confidence is a key value in machine learning. It\'s a good practice to only trust detections that have a high confidence score (e.g., > 0.75).'
      }
    ]
  },
  {
    id: 'lesson15',
    type: 'lesson',
    title: '15. Next Steps & Road Runner',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Congratulations! You have completed the core concepts of FTC Java programming. You now have the tools to build a competitive TeleOp and a reliable, multi-step autonomous routine. You can build a great robot with these skills alone.'
      },
      { type: LessonContentType.Heading, text: 'Where to Go From Here?' },
      {
        type: LessonContentType.Paragraph,
        text: 'The world of robotics is vast. The next level of FTC programming involves combining all these concepts and using more advanced libraries to achieve higher performance and consistency. The most popular and powerful of these is **Road Runner**.'
      },
      { type: LessonContentType.Heading, text: 'What is Road Runner?' },
      {
        type: LessonContentType.Paragraph,
        text: 'Road Runner is a sophisticated motion planning library. Instead of telling your robot "drive forward 24 inches, then turn 90 degrees," you define a continuous, smooth path (a trajectory) with curves and complex movements. Road Runner then calculates the precise, coordinated wheel velocities needed to follow that path perfectly.'
      },
      {
        type: LessonContentType.List,
        items: [
            'It uses a technique called **odometry**, often with special unpowered tracking wheels, for hyper-accurate, real-time position tracking on the field.',
            'It uses advanced **feedforward** and **PID** control on each wheel to ensure the robot stays on the planned path, even with wheel slip or battery drain.',
            'It allows you to build complex, multi-step autonomous paths that are smooth, fast, and highly repeatable by chaining these trajectories together.',
            'It is the tool used by the vast majority of high-performing FTC teams for autonomous control.'
        ]
      },
       { type: LessonContentType.Heading, text: 'Learning Road Runner' },
      {
        type: LessonContentType.Paragraph,
        text: 'Learning Road Runner is a project in itself that is highly rewarding. It requires excellent robot build quality (a square and rigid frame) and a detailed tuning process to characterize your robot\'s physical properties. The official documentation at <a href="https://learnroadrunner.com" target="_blank" rel="noopener noreferrer" style="color:hsl(var(--accent));text-decoration:underline;">learnroadrunner.com</a> is the definitive and best place to start. The concepts you\'ve learned in this course—hardware classes, PID theory, and state machines—provide the essential foundation you will need to understand and successfully implement it.'
      }
    ],
    quiz: [
      {
        question: 'What is the primary function of the Road Runner library?',
        options: ['To provide advanced motion planning for smooth, complex paths.', 'To analyze code for errors.', 'To control servos.', 'To manage team collaboration.'],
        correctAnswer: 'To provide advanced motion planning for smooth, complex paths.',
        explanation: 'Road Runner is a specialized library for generating and following complex trajectories, which is a significant step beyond simple, discrete state-based autonomous routines.'
      },
      {
        question: 'What is "odometry" and why is it important for Road Runner?',
        options: ['A method to measure distance with a sensor.', 'Getting the robot\'s orientation from the IMU.', 'Using unpowered wheels for precise position tracking.', 'A specialized type of drivetrain.'],
        correctAnswer: 'Using unpowered wheels for precise position tracking.',
        explanation: 'Odometry wheels are not connected to motors and are free-spinning. Because they don\'t slip like powered wheels, their encoders provide a much more accurate position estimate, which is critical for Road Runner\'s path-following algorithms.'
      },
      {
        question: 'Is Road Runner a simple, drop-in replacement for a state machine?',
        options: ['No, it requires significant setup and tuning.', 'Yes, it is a simple drop-in library.', 'No, it can only be used during TeleOp.', 'Yes, but it is an outdated technology.'],
        correctAnswer: 'No, it requires significant setup and tuning.',
        explanation: 'While incredibly powerful, Road Runner is an advanced tool. Successfully implementing it requires a solid understanding of the underlying robotics concepts and a willingness to follow the detailed tuning process.'
      }
    ]
  },
  {
    id: 'final-course-test',
    type: 'test',
    title: 'Beginner Final Test',
    isFinalTestForCourse: true,
    passingScore: 17,
    content: [
      {
        type: LessonContentType.Heading,
        text: 'Test Your Knowledge',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'This final test covers concepts from all the beginner lessons. You must score at least 17/21 to pass the course and unlock intermediate lessons. Good luck!'
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of the `waitForStart()` method in a `LinearOpMode`?",
        options: [
            "To wait for a specific amount of time before running.",
            "To separate the initialization code from the main run loop code.",
            "To check if the robot's hardware is connected correctly.",
            "To start the main run loop immediately."
        ],
        correctAnswer: "To separate the initialization code from the main run loop code.",
        explanation: "waitForStart() pauses the OpMode execution until the driver presses the PLAY button. Code before it runs on INIT; code after it runs on PLAY."
      },
      {
        question: "What is the most common cause of a `HardwareDeviceNotFoundException`?",
        options: [
            "The battery is too low.",
            "A name in the code doesn't match the configuration file.",
            "A motor is unplugged.",
            "The Wi-Fi connection is weak."
        ],
        correctAnswer: "A name in the code doesn't match the configuration file.",
        explanation: "This error means the hardwareMap couldn't find a device with the specified name. It's often due to a typo or case-mismatch."
      },
      {
        question: "What is the valid range of values for a standard servo's position, set by `.setPosition()`?",
        options: [
            "0.0 to 1.0",
            "-1.0 to 1.0",
            "0 to 100",
            "Any number"
        ],
        correctAnswer: "0.0 to 1.0",
        explanation: "A servo's position is set with a value from 0.0 to 1.0, which corresponds to its full range of motion (e.g., 0 to 180 degrees)."
      },
      {
        question: "What data type does `gamepad1.right_trigger` return?",
        options: [
            "boolean",
            "double",
            "String",
            "int"
        ],
        correctAnswer: "double",
        explanation: "Triggers are analog inputs, returning a `double` from 0.0 (unpressed) to 1.0 (fully pressed)."
      },
      {
        question: "How do you check if a `TouchSensor` named `limitSwitch` is currently being pressed?",
        options: [
            "`limitSwitch.isPressed()`",
            "`limitSwitch.getValue() == 1`",
            "`limitSwitch.isTouched()`",
            "`limitSwitch.getStatus() == 'PRESSED'`"
        ],
        correctAnswer: "`limitSwitch.isPressed()`",
        explanation: "The `.isPressed()` method returns a boolean (`true` or `false`) indicating the sensor's state."
      },
      {
        question: "What is the difference between `RUN_USING_ENCODER` and `RUN_TO_POSITION`?",
        options: [
            "They are the same.",
            "`RUN_USING_ENCODER` is for manual power control; `RUN_TO_POSITION` is for autonomous targeting.",
            "`RUN_TO_POSITION` is for TeleOp, `RUN_USING_ENCODER` for Auto.",
            "`RUN_USING_ENCODER` is less accurate."
        ],
        correctAnswer: "`RUN_USING_ENCODER` is for manual power control; `RUN_TO_POSITION` is for autonomous targeting.",
        explanation: "`RUN_USING_ENCODER` is for driver control or manual PID loops, while `RUN_TO_POSITION` is a self-contained mode for autonomous movements."
      },
      {
        question: "What is the primary benefit of creating a dedicated Hardware Class?",
        options: [
            "It is required by the game rules.",
            "It centralizes hardware mapping, making code cleaner.",
            "It makes the robot run faster.",
            "It improves battery life."
        ],
        correctAnswer: "It centralizes hardware mapping, making code cleaner.",
        explanation: "A hardware class reduces code duplication and makes it easy to update hardware configurations across all your OpModes."
      },
      {
        question: "In a state machine for an autonomous routine, what is an `enum` typically used for?",
        options: [
            "To count the number of seconds.",
            "To store motor power values.",
            "To calculate distances.",
            "To define a set of clear, readable names for each state."
        ],
        correctAnswer: "To define a set of clear, readable names for each state.",
        explanation: "Enums make state machine code self-documenting and prevent errors from using 'magic numbers' to represent states."
      },
      {
        question: "To make a mecanum robot drive directly forward, how should the wheels be powered?",
        options: [
            "Front wheels forward, back wheels backward.",
            "All four wheels spin forward.",
            "Left wheels forward, right wheels backward.",
            "Only the front wheels spin."
        ],
        correctAnswer: "All four wheels spin forward.",
        explanation: "To drive forward, the side-to-side forces from the mecanum rollers must cancel out, which happens when all wheels spin in the same direction."
      },
      {
        question: "In a PID controller, what is the primary role of the 'P' (Proportional) term?",
        options: [
            "To prevent overshooting the target.",
            "To provide the main driving force, which is proportional to the current error.",
            "To correct for small, constant errors like gravity.",
            "To remember past errors."
        ],
        correctAnswer: "To provide the main driving force, which is proportional to the current error.",
        explanation: "The Proportional term is the core of the controller; it applies power based on how far the system is from its target."
      },
      {
        question: "What does 'field-centric' drive mean for a mecanum robot?",
        options: [
            "Joystick 'forward' always moves the robot 'forward' on the field.",
            "The robot can only drive in the center of the field.",
            "The driver's joystick inputs are relative to the robot's orientation.",
            "The robot uses GPS to know its position."
        ],
        correctAnswer: "Joystick 'forward' always moves the robot 'forward' on the field.",
        explanation: "Field-centric drive uses the IMU to make driving more intuitive, as joystick directions correspond to the field, not the robot."
      },
      {
        question: "What SDK class is used to create a simple stopwatch to add timeouts to a state machine?",
        options: [
            "`Timer`",
            "`Stopwatch`",
            "`Clock`",
            "`ElapsedTime`"
        ],
        correctAnswer: "`ElapsedTime`",
        explanation: "The `ElapsedTime` class is the standard, easy-to-use timer provided by the FTC SDK for measuring time intervals."
      },
      {
        question: "When using the AprilTag processor, what information does `detection.ftcPose.range` provide?",
        options: [
            "The range of possible tag IDs.",
            "The distance from the camera to the tag.",
            "The angle of the tag relative to the camera.",
            "The tag's family."
        ],
        correctAnswer: "The distance from the camera to the tag.",
        explanation: "`ftcPose.range` is a direct measurement of the distance (in the units of your tag size definition) to the detected tag."
      },
      {
        question: "What is the purpose of a `.tflite` file when using the TensorFlow Object Detection (TFOD) processor?",
        options: [
            "It's a configuration file for the webcam.",
            "It's the trained machine learning model file.",
            "It's a text file containing the names of objects.",
            "It's a log file of all detections."
        ],
        correctAnswer: "It's the trained machine learning model file.",
        explanation: "The `.tflite` file is the final, compressed output of a TensorFlow training process, which the FTC SDK uses to perform object detection."
      },
      {
        question: "What is the main advantage of the Road Runner motion planning library over a simple state machine?",
        options: [
            "It is easier to set up.",
            "It generates smooth, repeatable paths for autonomous.",
            "It uses less battery power.",
            "It only works for tank drive robots."
        ],
        correctAnswer: "It generates smooth, repeatable paths for autonomous.",
        explanation: "Road Runner excels at creating optimized, curved paths, which are often faster and more reliable than a sequence of discrete drive-and-turn actions."
      },
      {
        question: "To command a motor to spin at 50% power backwards, what value would you pass to `.setPower()`?",
        options: [
            "50",
            "0.5",
            "-0.5",
            "-50"
        ],
        correctAnswer: "-0.5",
        explanation: "Motor power ranges from -1.0 (full reverse) to 1.0 (full forward). 50% reverse is -0.5."
      },
      {
        question: "What is the purpose of `telemetry.update()`?",
        options: [
            "To send all staged data to the Driver Hub screen.",
            "To update the software on the robot controller.",
            "To check for errors in the telemetry.",
            "To clear the telemetry log."
        ],
        correctAnswer: "To send all staged data to the Driver Hub screen.",
        explanation: "`telemetry.addData()` stages data, but `telemetry.update()` is the command that actually transmits it to be displayed."
      },
      {
        question: "To create a toggle for a claw mechanism using a button, you need to detect the:",
        options: [
            "Button's press duration.",
            "Button's color.",
            "Button's 'rising edge' (the moment it becomes pressed).",
            "Button's 'falling edge' (the moment it is released)."
        ],
        correctAnswer: "Button's 'rising edge' (the moment it becomes pressed).",
        explanation: "To prevent the toggle from happening continuously while the button is held, you must check for the transition from not pressed to pressed."
      },
      {
        question: "In a PID controller for a robot's turn, what would be the 'Target' value?",
        options: [
            "The desired angle in degrees (e.g., 90.0).",
            "The current motor power.",
            "The desired motor speed.",
            "The battery voltage."
        ],
        correctAnswer: "The desired angle in degrees (e.g., 90.0).",
        explanation: "The 'Target' is the goal you want to reach. For a turn, this is the desired final angle of the robot."
      },
      {
        question: "What is the main function of the `VisionPortal.Builder()`?",
        options: [
            "To design a new AprilTag.",
            "To build a new robot.",
            "To configure a vision pipeline with processors and a camera.",
            "To change the camera's lens."
        ],
        correctAnswer: "To configure a vision pipeline with processors and a camera.",
        explanation: "The VisionPortal is the main entry point for using the FTC vision system, allowing you to link one or more processors to a camera."
      },
      {
        question: "When implementing a custom PID loop to hold a robot arm at a specific position, which motor `RunMode` is most appropriate, and why?",
        options: [
          "`RUN_TO_POSITION`, because it has a built-in PID controller.",
          "`RUN_WITHOUT_ENCODER`, as it allows manual power control while still reading the encoder.",
          "`STOP_AND_RESET_ENCODER`, because it zeros the position before the loop starts.",
          "`RUN_USING_ENCODER`, because it provides built-in velocity control for smoother movement."
        ],
        correctAnswer: "`RUN_WITHOUT_ENCODER`, as it allows manual power control while still reading the encoder.",
        explanation: "`RUN_TO_POSITION` takes over control, preventing your custom loop from working. `RUN_USING_ENCODER` attempts to maintain a constant velocity, which interferes with a position-based PID. `RUN_WITHOUT_ENCODER` gives your code full control over the motor's power, which is what your PID calculation needs, while still allowing you to read `getCurrentPosition()` to calculate error."
      }
    ]
  }
];
