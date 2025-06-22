
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
}

export const ftcJavaLessons: Lesson[] = [
  {
    id: 'placement-test',
    title: 'Placement Test',
    type: 'placement',
    content: [
      { type: LessonContentType.Heading, text: 'Find Your Starting Point' },
      { type: LessonContentType.Paragraph, text: 'This short test will help us figure out the best place for you to start learning. Don\'t worry if you don\'t know all the answers—just do your best!' },
    ],
    quiz: [
      {
        question: 'In Java, what keyword is used to declare a variable that cannot be changed?',
        options: ['static', 'final', 'const', 'let'],
        correctAnswer: 'final',
        explanation: 'The `final` keyword in Java is used to create a constant variable, whose value cannot be reassigned after it is initialized.'
      },
      {
        question: 'What is the main purpose of a `for` loop?',
        options: ['To make a decision', 'To store a list of items', 'To repeat a block of code a specific number of times', 'To define a new function'],
        correctAnswer: 'To repeat a block of code a specific number of times',
        explanation: 'A `for` loop is ideal when you know exactly how many times you want to iterate, for example, looping through all items in an array.'
      },
      {
        question: 'Which of these is NOT a primitive data type in Java?',
        options: ['int', 'boolean', 'String', 'double'],
        correctAnswer: 'String',
        explanation: 'In Java, `String` is an object, not a primitive type. Primitive types (like int, boolean, double) are the most basic data types.'
      },
      {
        question: 'In FTC, what is the `hardwareMap` used for?',
        options: ['To draw a map of the field', 'To link your code variables to the physical hardware on the robot', 'To manage WiFi connections', 'To store game scores'],
        correctAnswer: 'To link your code variables to the physical hardware on the robot',
        explanation: 'The `hardwareMap` is a crucial part of the FTC SDK that allows your code to get a reference to a motor, servo, or sensor defined in your robot\'s configuration.'
      },
    ],
  },
  {
    id: 'lesson1',
    title: 'Java Basics',
    type: 'lesson',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Welcome to the first lesson! Here, we will cover foundational concepts to get you started with Java for FTC programming.',
      },
      { type: LessonContentType.Heading, text: 'What is Java?' },
      {
        type: LessonContentType.Paragraph,
        text: 'Java is a versatile, object-oriented programming language. In FTC, Java is used to write programs called <b>OpModes</b>, which tell your robot how to behave during matches.',
      },
      { type: LessonContentType.Heading, text: 'Your First OpMode' },
      {
        type: LessonContentType.Paragraph,
        text: 'An OpMode is like a mini program that runs on your robot. Below is an example of a simple OpMode that sends a message to the driver station:',
      },
      {
        type: LessonContentType.Code,
        code: `@TeleOp(name="HelloFTC", group="Tutorial")
public class HelloFTC extends LinearOpMode {
  @Override
  public void runOpMode() {
    telemetry.addData("Message", "Hello FTC!");
    telemetry.update();
    waitForStart();
    while (opModeIsActive()) {
      // Robot code here
    }
  }
}`,
      },
      { type: LessonContentType.Heading, text: 'Key Concepts' },
      {
        type: LessonContentType.List,
        items: [
            '<b>Class:</b> A blueprint for creating objects. `HelloFTC` is a class.',
            '<b>Method:</b> A block of code that performs a specific task, like `runOpMode()`.',
            '<b>Variable:</b> A container for storing data values.',
            '<b>telemetry:</b> An object used to send data to the Driver Station screen for debugging.'
        ]
      }
    ],
    quiz: [
      {
        question: 'What programming language is used for FTC?',
        options: ['Python', 'Java', 'C++', 'Blockly'],
        correctAnswer: 'Java',
        explanation: 'Java is the primary, text-based programming language used in the FIRST Tech Challenge, running on the Android-based robot controllers.'
      },
      {
        question: 'What is an OpMode?',
        options: [
            'A special mode for the robot\'s operator',
            'A program that controls the robot during a match',
            'An optical sensor module',
            'A type of motor controller'
        ],
        correctAnswer: 'A program that controls the robot during a match',
        explanation: 'An OpMode (Operation Mode) is a class in the FTC SDK that contains the logic for how your robot should behave, either autonomously or under driver control.'
      },
      {
        question: 'What is the main purpose of the `telemetry.update()` command?',
        options: [
            'To update the robot\'s firmware',
            'To save data to the robot controller phone',
            'To send all added telemetry data to the Driver Station screen',
            'To refresh the connection to the gamepad'
        ],
        correctAnswer: 'To send all added telemetry data to the Driver Station screen',
        explanation: 'You can add multiple pieces of data using `telemetry.addData()`, but none of it will appear on the Driver Station phone until you call `telemetry.update()`.'
      }
    ],
  },
  {
    id: 'lesson2',
    title: 'Robot Structure',
    type: 'lesson',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Understanding how OpModes and robot hardware are structured is essential for FTC programming.',
      },
      { type: LessonContentType.Heading, text: 'Types of OpModes' },
      {
        type: LessonContentType.Paragraph,
        text: 'There are two main types:',
      },
      {
        type: LessonContentType.List,
        items: ['<b>TeleOp:</b> Runs during driver-controlled periods. You use this to map gamepad buttons to robot actions.', '<b>Autonomous:</b> Runs pre-programmed instructions without driver input.'],
      },
      { type: LessonContentType.Heading, text: 'Hardware Mapping' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `hardwareMap` links code names to physical robot hardware. It\'s crucial that the names you use in your code (like `"left_drive"`) exactly match the names in your robot\'s configuration file.',
      },
      {
        type: LessonContentType.Code,
        code: `// This line gets the motor named "left_drive" from the config
leftDrive = hardwareMap.get(DcMotor.class, "left_drive");`
      }
    ],
    quiz: [
      { 
        question: "What are the two main types of OpModes?", 
        options: ["Start and Stop", "Manual and Auto", "TeleOp and Autonomous", "Driver and Coder"],
        correctAnswer: "TeleOp and Autonomous",
        explanation: "TeleOp is for driver control, and Autonomous is for pre-programmed routines."
      },
      { 
        question: "What object is used to link code variables to hardware devices?", 
        options: ["deviceManager", "robotMap", "controlHub", "hardwareMap"],
        correctAnswer: "hardwareMap",
        explanation: "The hardwareMap is provided by the FTC SDK to get references to your configured motors, servos, and sensors."
      },
      { 
        question: "Why might you need to set a motor's direction to REVERSE?", 
        options: ["To make it spin slower", "Because it was wired backwards", "So it can drive backwards in autonomous", "If the motor is mounted opposite to another motor on the drivetrain"],
        correctAnswer: "If the motor is mounted opposite to another motor on the drivetrain",
        explanation: "On a standard drivetrain, motors on opposite sides are mirror images, so one needs to be electrically reversed for them to turn the same way."
      }
    ],
  },
  {
    id: 'unit-1-test',
    title: 'Unit 1 Test',
    type: 'test',
    content: [
      { type: LessonContentType.Heading, text: 'Unit 1 Knowledge Test' },
      { type: LessonContentType.Paragraph, text: 'Let\'s review what you\'ve learned in the first couple of lessons.' },
    ],
    quiz: [
      {
        question: 'An OpMode is a...',
        options: ['Hardware device', 'Type of battery', 'Software program for the robot', 'Team role'],
        correctAnswer: 'Software program for the robot',
        explanation: 'An OpMode is the main program that controls your robot\'s logic and actions.'
      },
      {
        question: 'Which method call is required to see telemetry data on the Driver Hub?',
        options: ['telemetry.start()', 'telemetry.print()', 'telemetry.show()', 'telemetry.update()'],
        correctAnswer: 'telemetry.update()',
        explanation: 'Data added with `telemetry.addData` is buffered and only sent to the screen after `telemetry.update()` is called.'
      },
      {
        question: 'The name used in `hardwareMap.get(DcMotor.class, "motor_name")` must match the name in the...',
        options: ['Java documentation', 'Robot\'s configuration file', 'Team roster', 'Game manual'],
        correctAnswer: 'Robot\'s configuration file',
        explanation: 'The string name must exactly match the name you gave the device in the robot controller\'s configuration settings.'
      },
    ],
  },
  { 
    id: 'lesson3', 
    title: 'Motors & Movement', 
    type: 'lesson',
    content: [
        {type: LessonContentType.Paragraph, text:"Controlling motors powers your robot’s movement and mechanisms. Let’s dive into how to control motors effectively."},
        {type: LessonContentType.Heading, text:"Motor Initialization & Direction"},
        {type: LessonContentType.Code, code: `leftDrive = hardwareMap.get(DcMotor.class, "left_drive");\nrightDrive = hardwareMap.get(DcMotor.class, "right_drive");\nleftDrive.setDirection(DcMotor.Direction.FORWARD);\nrightDrive.setDirection(DcMotor.Direction.REVERSE);`},
        {type: LessonContentType.Heading, text:"Motor Power Range"},
        {type: LessonContentType.Paragraph, text:"Power values range from -1.0 (full reverse) to 1.0 (full forward), with 0 being stop. Setting power controls motor speed and direction."},
        {type: LessonContentType.Code, code: `// Set the left motor to 50% forward power\nleftDrive.setPower(0.5);`},
        {type: LessonContentType.Heading, text:"Motor Modes"},
        {type: LessonContentType.Paragraph, text:"Different motor modes include RUN_WITHOUT_ENCODER (simple power control) and RUN_TO_POSITION (move to a target position)."}
    ], 
    quiz: [
        {
          question: "What is the valid range for motor power?", 
          options: ["0 to 100", "-1.0 to 1.0", "-255 to 255", "0 to 1.0"],
          correctAnswer: "-1.0 to 1.0",
          explanation: "Motor power is represented as a decimal from -1.0 (full reverse) to 1.0 (full forward), with 0 being stopped."
        },
        {
          question: "To make a standard tank-drive robot turn right in place, what should you do?", 
          options: ["Set left motor to 0.5, right motor to 0.5", "Set left motor to -0.5, right motor to -0.5", "Set left motor to 0.5, right motor to -0.5", "Set left motor to 0, right motor to 0.5"],
          correctAnswer: "Set left motor to 0.5, right motor to -0.5",
          explanation: "Spinning the wheels on opposite sides in opposite directions causes the robot to pivot, or turn in place."
        },
        {
          question: "Which motor mode would you use to have a motor move to a specific rotation and stop there?", 
          options: ["RUN_WITHOUT_ENCODER", "RUN_USING_ENCODER", "RUN_TO_POSITION", "STOP_AND_RESET_ENCODER"],
          correctAnswer: "RUN_TO_POSITION",
          explanation: "RUN_TO_POSITION uses the motor's built-in encoder and a PID controller to move to a target position and hold it."
        }
    ] 
  },
  { 
    id: 'lesson4', 
    title: 'Sensors & Input', 
    type: 'lesson',
    content: [
        {type: LessonContentType.Paragraph, text:"Sensors give your robot the ability to “sense” its environment or its own state, which is critical for advanced behaviors."},
        {type: LessonContentType.Heading, text:"Common FTC Sensors"},
        {type: LessonContentType.List, items: ["<b>Touch Sensors:</b> Detect if a button is pressed.", "<b>Color Sensors:</b> Detect the color of a surface.", "<b>Distance Sensors:</b> Measure distance to an object.", "<b>IMU (Gyroscope):</b> Measures the robot's orientation and rotation."]},
        {type: LessonContentType.Heading, text:"Reading Sensor Data"},
        {type: LessonContentType.Code, code: `boolean isPressed = touchSensor.isPressed();\nint redValue = colorSensor.red();\ndouble distance_cm = distanceSensor.getDistance(DistanceUnit.CM);`},
        {type: LessonContentType.Paragraph, text:"Using sensor data inside loops allows your robot to react to its environment in real time."}
    ], 
    quiz: [
        {
          question: "What does an IMU sensor typically measure?", 
          options: ["The distance to an object", "The color of the floor", "The robot's orientation and rotation", "The current motor power"],
          correctAnswer: "The robot's orientation and rotation",
          explanation: "An IMU (Inertial Measurement Unit) contains a gyroscope and accelerometer to track the robot's heading and rotation."
        },
        {
          question: "If a `touchSensor.isPressed()` returns `true`, what does it mean?", 
          options: ["The sensor is not working", "The sensor's button is currently being pushed", "The sensor is ready to be pressed", "The sensor has been pressed in the past"],
          correctAnswer: "The sensor's button is currently being pushed",
          explanation: "The `.isPressed()` method returns the current state of the touch sensor's button."
        },
        {
          question: "Which sensor would be best for determining the robot's heading (which way it's facing)?", 
          options: ["Color Sensor", "Distance Sensor", "Touch Sensor", "IMU"],
          correctAnswer: "IMU",
          explanation: "The IMU is specifically designed to measure orientation and is the standard way to track the robot's heading."
        }
    ] 
  },
  { 
    id: 'lesson5', 
    title: 'Gamepad Controls', 
    type: 'lesson',
    content: [
        {type: LessonContentType.Paragraph, text:"Gamepads are the primary way drivers control the robot during TeleOp periods."},
        {type: LessonContentType.Heading, text:"Accessing Gamepads"},
        {type: LessonContentType.Paragraph, text:"The FTC SDK provides two objects, `gamepad1` and `gamepad2`, which represent the two controllers."},
        {type: LessonContentType.Heading, text:"Joystick and Button Inputs"},
        {type: LessonContentType.List, items: ["<b>Joysticks:</b> Return decimal values (floats) from -1.0 to 1.0. Example: `gamepad1.left_stick_y`", "<b>Buttons:</b> Return boolean values (true or false). Example: `gamepad1.a`", "<b>Triggers:</b> Return decimal values (floats) from 0.0 to 1.0. Example: `gamepad1.right_trigger`"]},
        {type: LessonContentType.Code, code: `// Arcade Drive Example
double drive = -gamepad1.left_stick_y;  // Forward/Backward
double turn  =  gamepad1.right_stick_x; // Left/Right Turn

double leftPower  = drive + turn;
double rightPower = drive - turn;

leftDrive.setPower(leftPower);
rightDrive.setPower(rightPower);

// Mechanism Control Example
if (gamepad1.a) {
  intakeMotor.setPower(1.0);
} else {
  intakeMotor.setPower(0.0);
}`}
    ], 
    quiz: [
        {
          question: "In the code `double drive = -gamepad1.left_stick_y;`, why is the value from `left_stick_y` often negated (multiplied by -1)?", 
          options: ["To make the robot go faster", "Because joysticks are inverted by default, where 'up' is negative", "To prevent the robot from driving backward", "Because it's a programming convention"],
          correctAnswer: "Because joysticks are inverted by default, where 'up' is negative",
          explanation: "Most gamepads report the 'up' direction on a Y-axis as a negative value, so you multiply by -1 to make 'up' correspond to positive motor power."
        },
        {
          question: "What is the difference between `gamepad1.a` and `gamepad1.right_trigger`?", 
          options: ["There is no difference", "`a` is a button, `right_trigger` is a joystick", "`a` is a boolean (true/false), `right_trigger` is a float (0.0 to 1.0)", "`a` is for autonomous, `right_trigger` is for TeleOp"],
          correctAnswer: "`a` is a boolean (true/false), `right_trigger` is a float (0.0 to 1.0)",
          explanation: "Standard buttons like 'a' are digital and return true or false. Triggers are analog and return a decimal value indicating how far they are pressed."
        },
        {
          question: "Which gamepad property would you use to implement an 'arcade drive' where one stick controls forward/backward and the other controls turning?", 
          options: ["left_stick_y and right_stick_y", "left_stick_y and left_stick_x", "dpad_up and dpad_down", "a and b buttons"],
          correctAnswer: "left_stick_y and left_stick_x",
          explanation: "Arcade drive typically maps the Y-axis of one stick to forward/backward motion and the X-axis of the same (or other) stick to turning."
        }
    ] 
  }
];
