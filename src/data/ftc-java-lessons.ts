
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
  content: LessonContentItem[];
  quiz: QuizItem[];
}

export const ftcJavaLessons: Lesson[] = [
  {
    id: 'lesson1',
    title: 'Lesson 1: FTC & Java Basics',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Welcome to the first lesson of the FTC Java programming course! Here, we will cover foundational concepts to get you started with FTC programming.',
      },
      { type: LessonContentType.Heading, text: 'What is FTC?' },
      {
        type: LessonContentType.Paragraph,
        text: 'The FIRST Tech Challenge (FTC) is a robotics competition where teams design, build, and program robots to compete in a game. FTC uses Android phones and Java programming to control robots.',
      },
      { type: LessonContentType.Heading, text: 'Introduction to Java' },
      {
        type: LessonContentType.Paragraph,
        text: 'Java is a versatile programming language. In FTC, Java is used to write programs called OpModes, which tell your robot how to behave during matches.',
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
      { type: LessonContentType.Heading, text: 'Setting Up Your Environment' },
      {
        type: LessonContentType.Paragraph,
        text: "You'll need Android Studio and the FTC SDK installed on your computer. These allow you to write and upload your code to your robot controller phone.",
      },
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
    title: 'Lesson 2: OpModes & Robot Structure',
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
        items: ['TeleOp: Runs during driver-controlled periods.', 'Autonomous: Runs pre-programmed instructions without driver input.'],
      },
      { type: LessonContentType.Heading, text: 'Hardware Mapping' },
      {
        type: LessonContentType.Paragraph,
        text: 'The hardwareMap links code names to physical robot hardware. Matching names in your configuration is vital.',
      },
      {
        type: LessonContentType.Code,
        code: `@TeleOp(name="Basic Structure", group="Linear Opmode")
public class BasicStructure extends LinearOpMode {
  private DcMotor leftDrive;
  private DcMotor rightDrive;

  @Override
  public void runOpMode() {
    leftDrive = hardwareMap.get(DcMotor.class, "left_drive");
    rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

    leftDrive.setDirection(DcMotor.Direction.FORWARD);
    rightDrive.setDirection(DcMotor.Direction.REVERSE);

    telemetry.addData("Status", "Initialized");
    telemetry.update();

    waitForStart();

    while (opModeIsActive()) {
      telemetry.addData("Left Power", leftDrive.getPower());
      telemetry.addData("Right Power", rightDrive.getPower());
      telemetry.update();
    }
  }
}`,
      },
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
    id: 'lesson3', 
    title: 'Lesson 3: Motors & Movement', 
    content: [
        {type: LessonContentType.Paragraph, text:"Controlling motors powers your robot’s movement and mechanisms. Let’s dive into how to control motors effectively."},
        {type: LessonContentType.Heading, text:"Motor Initialization & Direction"},
        {type: LessonContentType.Code, code: `leftDrive = hardwareMap.get(DcMotor.class, "left_drive");\nrightDrive = hardwareMap.get(DcMotor.class, "right_drive");\nleftDrive.setDirection(DcMotor.Direction.FORWARD);\nrightDrive.setDirection(DcMotor.Direction.REVERSE);`},
        {type: LessonContentType.Heading, text:"Motor Power Range"},
        {type: LessonContentType.Paragraph, text:"Power values range from -1.0 (full reverse) to 1.0 (full forward). Setting power controls motor speed and direction."},
        {type: LessonContentType.Heading, text:"Basic Movement Patterns"},
        {type: LessonContentType.List, items: ["Forward: Both motors set to positive power.", "Backward: Both motors set to negative power.", "Turn Right: Left motor positive, right motor negative.", "Turn Left: Left motor negative, right motor positive."]},
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
    title: 'Lesson 4: Sensors & Input', 
    content: [
        {type: LessonContentType.Paragraph, text:"Sensors give your robot the ability to “sense” its environment or its own state, which is critical for advanced behaviors."},
        {type: LessonContentType.Heading, text:"Common FTC Sensors"},
        {type: LessonContentType.List, items: ["Touch Sensors", "Color Sensors", "Distance Sensors (e.g., ultrasonic, optical)", "IMU (Inertial Measurement Unit) / Gyroscope"]},
        {type: LessonContentType.Heading, text:"Reading Sensor Data"},
        {type: LessonContentType.Code, code: `int redValue = colorSensor.red();\nOrientation angles = imu.getAngularOrientation();\ndouble heading = angles.firstAngle;`},
        {type: LessonContentType.Heading, text:"Using Sensor Data"},
        {type: LessonContentType.Paragraph, text:"Robots can stop on obstacles, align to objects, or balance using sensor inputs."}
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
    title: 'Lesson 5: Gamepad Controls', 
    content: [
        {type: LessonContentType.Paragraph, text:"Gamepads are the primary way drivers control the robot during TeleOp periods."},
        {type: LessonContentType.Heading, text:"Reading Joystick Values"},
        {type: LessonContentType.Code, code: `double leftStickY = -gamepad1.left_stick_y;\ndouble rightStickX = gamepad1.right_stick_x;`},
        {type: LessonContentType.Heading, text:"Driving Control Methods"},
        {type: LessonContentType.List, items: ["Tank Drive: Each joystick controls one side's wheels.", "Arcade Drive: One joystick controls forward/backward, the other controls turning."]},
        {type: LessonContentType.Heading, text:"Button & Trigger Inputs"},
        {type: LessonContentType.Code, code: `if (gamepad1.a) {\n  // Activate mechanism\n}`}
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
  },
  { 
    id: 'lesson6', 
    title: 'Lesson 6: Autonomous Programming', 
    content: [
        {type: LessonContentType.Paragraph, text:"Autonomous mode lets the robot act on its own using pre-programmed instructions and sensors."},
        {type: LessonContentType.Heading, text:"Structure of Autonomous OpModes"},
        {type: LessonContentType.Paragraph, text:"Typically uses LinearOpMode and runs sequential commands after waitForStart()."},
        {type: LessonContentType.Heading, text:"Example Autonomous Code"},
        {type: LessonContentType.Code, code: `waitForStart();\ndriveForward(24); // Drive 24 inches forward\nturnDegrees(90);  // Turn 90 degrees right\ndropMarker();     // Activate mechanism`},
        {type: LessonContentType.Heading, text:"Using Sensors in Autonomous"},
        {type: LessonContentType.Paragraph, text:"Sensors like IMU and distance sensors help the robot navigate accurately."}
    ], 
    quiz: [
      {
        question: "In a `LinearOpMode`, what happens after the `waitForStart()` method is called?",
        options: ["The OpMode ends immediately", "The code waits for the driver to press the Start button on the Driver Station", "It initializes all the hardware", "It runs the TeleOp code"],
        correctAnswer: "The code waits for the driver to press the Start button on the Driver Station",
        explanation: "`waitForStart()` pauses the program's execution until the match officially begins, preventing the robot from moving prematurely."
      },
      {
        question: "Why are custom functions like `driveForward(distance)` or `turnDegrees(angle)` useful in autonomous?",
        options: ["They are required by the FTC SDK", "They make the code easier to read and reuse", "They make the robot drive faster", "They are the only way to control motors"],
        correctAnswer: "They make the code easier to read and reuse",
        explanation: "Abstracting complex motor commands into simple, readable functions (a concept called 'abstraction') makes your autonomous routines much easier to write, debug, and modify."
      },
      {
        question: "What is a major risk of creating an autonomous path that relies only on time-based movements (e.g., `drive forward for 2 seconds`)?",
        options: ["It is too difficult to program", "It's the most accurate method", "Variations in battery voltage will cause inconsistent distances", "It requires too many sensors"],
        correctAnswer: "Variations in battery voltage will cause inconsistent distances",
        explanation: "As the battery drains, the motors will spin slower, so running them for a fixed amount of time will cover less distance. This is why encoders or other sensors are needed for accuracy."
      }
    ] 
  },
  { 
    id: 'lesson7', 
    title: 'Lesson 7: PID Control', 
    content: [
        {type: LessonContentType.Paragraph, text:"PID control helps your robot make smooth, precise movements by adjusting motor power based on error values."},
        {type: LessonContentType.Heading, text:"What is PID?"},
        {type: LessonContentType.Paragraph, text:"PID stands for Proportional, Integral, and Derivative — three terms used to calculate corrective power."},
        {type: LessonContentType.Heading, text:"Basic PID Loop"},
        {type: LessonContentType.Code, code: `error = targetPosition - currentPosition;\nintegral += error * dt;\nderivative = (error - lastError) / dt;\noutput = kP * error + kI * integral + kD * derivative;\nmotor.setPower(output);\nlastError = error;`},
        {type: LessonContentType.Heading, text:"Benefits of PID"},
        {type: LessonContentType.List, items: ["Smoother motion", "Less overshoot", "More accurate positioning"]}
    ], 
    quiz: [
        {
          question: "What does the 'P' in PID stand for, and what does it do?", 
          options: ["Power: It sets the motor's max speed", "Proportional: It reacts to the current error size", "Position: It calculates the target position", "Previous: It considers the last error"],
          correctAnswer: "Proportional: It reacts to the current error size",
          explanation: "The Proportional term provides a corrective force that is directly proportional to how far the system is from its target. A bigger error results in a bigger correction."
        },
        {
          question: "A robot arm using only P-control consistently stops just short of its target. Which PID term is designed to fix this steady-state error?", 
          options: ["The Proportional (P) term", "The Integral (I) term", "The Derivative (D) term", "The target position"],
          correctAnswer: "The Integral (I) term",
          explanation: "The Integral term accumulates small past errors over time. This accumulated value will eventually grow large enough to push the arm the final distance to its target."
        },
        {
          question: "What is the primary role of the Derivative (D) term in a PID controller?", 
          options: ["To eliminate steady-state error", "To speed up the initial movement", "To predict and counteract future error, reducing overshoot", "To calculate the total error"],
          correctAnswer: "To predict and counteract future error, reducing overshoot",
          explanation: "The Derivative term looks at how fast the error is changing. If the system is approaching the target very quickly, the D term applies a braking force to prevent it from overshooting."
        }
    ] 
  },
  { 
    id: 'lesson8', 
    title: 'Lesson 8: Computer Vision', 
    content: [
        {type: LessonContentType.Paragraph, text:"Computer vision helps your robot detect objects and field elements using cameras and software."},
        {type: LessonContentType.Heading, text:"TensorFlow Object Detection"},
        {type: LessonContentType.Paragraph, text:"TensorFlow lets your robot identify game elements using machine learning models."},
        {type: LessonContentType.Heading, text:"AprilTags & VuMarks"},
        {type: LessonContentType.Paragraph, text:"These are visual markers the robot can recognize to understand field location and objectives."},
        {type: LessonContentType.Heading, text:"Vision in Autonomous"},
        {type: LessonContentType.Paragraph, text:"Vision data helps the robot decide paths and scoring actions dynamically."}
    ], 
    quiz: [
      {
        question: "What is the primary purpose of using AprilTags in an FTC match?",
        options: ["To make the field look cooler", "To provide the robot with a known position and orientation on the field", "To detect the color of an object", "To measure the distance to the wall"],
        correctAnswer: "To provide the robot with a known position and orientation on the field",
        explanation: "AprilTags are like unique barcodes that the robot can see. Since their exact location on the field is known, the robot can calculate its own position by looking at them."
      },
      {
        question: "If your autonomous needs to detect one of three different game elements placed randomly, which technology would be most suitable?",
        options: ["IMU", "Touch Sensor", "TensorFlow Object Detection", "A simple color sensor"],
        correctAnswer: "TensorFlow Object Detection",
        explanation: "TensorFlow is ideal for this because you can train a model to recognize and differentiate between multiple distinct objects."
      },
      {
        question: "Why is a vision system often more reliable for autonomous navigation than just using encoders?",
        options: ["It's not; encoders are always better", "Wheel slip can cause encoder measurements to become inaccurate", "Vision systems don't require a camera", "Encoders use too much battery"],
        correctAnswer: "Wheel slip can cause encoder measurements to become inaccurate",
        explanation: "If the wheels slip on the mat, the encoders will count rotations, but the robot isn't actually moving that far. A vision system corrects for this by looking at the field itself."
      }
    ] 
  },
  { 
    id: 'lesson9', 
    title: 'Lesson 9: Advanced Mechanisms', 
    content: [
        {type: LessonContentType.Paragraph, text:"Arms, lifts, and claws let your robot interact with game pieces precisely and safely."},
        {type: LessonContentType.Heading, text:"Controlling Servos"},
        {type: LessonContentType.Code, code: `servo.setPosition(0.5); // Moves servo to mid position`},
        {type: LessonContentType.Heading, text:"Motors with Encoders"},
        {type: LessonContentType.Code, code: `liftMotor.setTargetPosition(1000);\nliftMotor.setMode(DcMotor.RunMode.RUN_TO_POSITION);\nliftMotor.setPower(0.6);`},
        {type: LessonContentType.Heading, text:"Safety Considerations"},
        {type: LessonContentType.List, items: ["Limit travel ranges to prevent damage.", "Use sensors to detect end limits.", "Use PID for smooth and controlled movement."]}
    ], 
    quiz: [
        {
          question: "What is a key difference between a regular servo and a continuous rotation servo?", 
          options: ["Regular servos can only move 90 degrees", "Continuous rotation servos are much stronger", "Regular servos move to a specific position (angle), while continuous servos rotate at a specific speed", "Regular servos are analog, continuous are digital"],
          correctAnswer: "Regular servos move to a specific position (angle), while continuous servos rotate at a specific speed",
          explanation: "A standard servo is for precise angular positioning (e.g., a grabber), while a continuous servo acts more like a small, speed-controllable motor."
        },
        {
          question: "You want to move a robot lift to a specific height and have it hold that position against gravity. What is the best approach?", 
          options: ["Run the motor at full power until a button is pressed", "Use a servo", "Use a motor in `RUN_TO_POSITION` mode with PID", "Run the motor at low power constantly"],
          correctAnswer: "Use a motor in `RUN_TO_POSITION` mode with PID",
          explanation: "`RUN_TO_POSITION` is designed for this. It moves to the target encoder count and will automatically apply power to hold that position if gravity tries to pull it down."
        },
        {
          question: "What is the purpose of a limit switch on a robot arm?", 
          options: ["To make the arm move faster", "To provide a hard stop and prevent the arm from moving past its safe physical limits", "To measure the arm's angle", "To make the arm stronger"],
          correctAnswer: "To provide a hard stop and prevent the arm from moving past its safe physical limits",
          explanation: "A limit switch is a touch sensor that tells the code when the mechanism has reached the end of its travel, preventing it from breaking itself."
        }
    ] 
  },
  { 
    id: 'lesson10', 
    title: 'Lesson 10: Competition Strategies', 
    content: [
        {type: LessonContentType.Paragraph, text:"Winning FTC competitions takes more than robot building — it needs teamwork and smart planning."},
        {type: LessonContentType.Heading, text:"Understanding the Game"},
        {type: LessonContentType.Paragraph, text:"Study the game manual to learn the rules, scoring, and challenges."},
        {type: LessonContentType.Heading, text:"Scouting and Planning"},
        {type: LessonContentType.Paragraph, text:"Analyze other teams to find strengths, weaknesses, and alliance opportunities."},
        {type: LessonContentType.Heading, text:"Match Strategies"},
        {type: LessonContentType.List, items: ["Maximize autonomous scoring points.", "Practice driver control skills.", "Design efficient and reliable mechanisms."]},
        {type: LessonContentType.Heading, text:"Team Communication"},
        {type: LessonContentType.Paragraph, text:"Clear communication and defined roles improve team performance."},
        {type: LessonContentType.Heading, text:"Time & Repair Management"},
        {type: LessonContentType.Paragraph, text:"Have plans for quick fixes and backups during matches."}
    ], 
    quiz: [
      {
        question: "During autonomous, your alliance partner's robot is very inconsistent. What is a good strategy?",
        options: ["Ignore them and run your own routine", "Try to push their robot out of the way", "Design a more conservative autonomous path that avoids their side of the field to guarantee some points", "Tell the judges their robot is broken"],
        correctAnswer: "Design a more conservative autonomous path that avoids their side of the field to guarantee some points",
        explanation: "It's often better to guarantee a smaller number of points for your alliance than to risk getting zero points because of a collision or interference."
      },
      {
        question: "What is the primary goal of scouting other teams at a competition?",
        options: ["To see if their robot is better than yours", "To identify their strengths and weaknesses for alliance selection and match strategy", "To copy their design ideas", "To distract their drive team"],
        correctAnswer: "To identify their strengths and weaknesses for alliance selection and match strategy",
        explanation: "Good scouting data is crucial for choosing the best alliance partner and for knowing how to play against your opponents in a match."
      },
      {
        question: "Your robot's intake mechanism breaks just before a qualification match. What is the most important first step?",
        options: ["Panic and give up", "Spend 10 minutes trying a complex fix", "Quickly assess if a very simple, partial fix can be done in 2 minutes to make it somewhat functional", "Argue with the referees for more time"],
        correctAnswer: "Quickly assess if a very simple, partial fix can be done in 2 minutes to make it somewhat functional",
        explanation: "In the pits, time is critical. A robot that is 50% functional is infinitely better than a robot that is 0% functional because you ran out of time trying for a perfect fix."
      }
    ] 
  },
];
