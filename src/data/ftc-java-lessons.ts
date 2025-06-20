
export interface QuizItem {
  question: string;
  answer: string;
}

export enum LessonContentType {
  Heading = 'heading',
  Paragraph = 'paragraph',
  Code = 'code',
  List = 'list',
  // YouTubeLink = 'youtubeLink', // Removed
  // Iframe = 'iframe', // Removed
}

export interface LessonContentItem {
  type: LessonContentType;
  text?: string;
  code?: string;
  items?: string[];
  url?: string; // Kept for potential future use with other link types, though not used now
  title?: string; // Kept for potential future use, though not used now
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
        question: '1. What programming language is used for FTC?',
        answer: 'Answer: Java is the programming language used in FTC.',
      },
      {
        question: '2. What is an OpMode?',
        answer: 'Answer: An OpMode is a program that runs on the robot, controlling its behavior during matches.',
      },
      {
        question: '3. What does telemetry.update() do?',
        answer: 'Answer: It sends updated data to the driver station screen for display.',
      },
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
        { question: "1. What are the two main types of OpModes?", answer: "Answer: TeleOp (driver controlled) and Autonomous (pre-programmed)." },
        { question: "2. What is the purpose of hardwareMap?", answer: "Answer: It connects code variables to physical robot hardware devices." },
        { question: "3. Why do motors need their direction set?", answer: "Answer: To ensure motors spin the correct way relative to robot design." }
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
        {question: "1. What is the valid range of motor power?", answer: "Answer: -1.0 to 1.0, where negative is reverse and positive is forward."},
        {question: "2. How do you make the robot turn right?", answer: "Answer: Set left motor power positive and right motor power negative."},
        {question: "3. What does RUN_TO_POSITION mode do?", answer: "Answer: Moves the motor to a specific encoder target position automatically."}
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
        {question: "1. Name three FTC sensors.", answer: "Answer: Touch sensor, color sensor, distance sensor, IMU."},
        {question: "2. How do you read the red value from a color sensor?", answer: "Answer: Using colorSensor.red()."},
        {question: "3. What does an IMU sensor provide?", answer: "Answer: Orientation and angular velocity data."}
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
        {question: "1. How do you read the left joystick Y-axis?", answer: "Answer: Using gamepad1.left_stick_y, usually negated for forward."},
        {question: "2. What is tank drive control?", answer: "Answer: Each joystick controls one side of the drivetrain."},
        {question: "3. How to detect if button A is pressed?", answer: "Answer: Check gamepad1.a boolean."}
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
        {question: "1. What method starts an autonomous OpMode?", answer: "Answer: waitForStart() waits for the start signal."},
        {question: "2. Why use sensors in autonomous mode?", answer: "Answer: To navigate accurately and interact with the field."},
        {question: "3. What is LinearOpMode?", answer: "Answer: An OpMode that runs code sequentially, easier for autonomous routines."}
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
        {question: "1. What does PID stand for?", answer: "Answer: Proportional, Integral, Derivative."},
        {question: "2. Which term reacts to current error?", answer: "Answer: Proportional (P) term."},
        {question: "3. Why use PID instead of just proportional control?", answer: "Answer: PID reduces overshoot and improves accuracy by using integral and derivative terms."}
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
        {question: "1. What is TensorFlow used for in FTC?", answer: "Answer: Detecting and identifying objects using machine learning."},
        {question: "2. What are AprilTags?", answer: "Answer: Visual markers used for robot localization and identification."},
        {question: "3. How does vision help autonomous mode?", answer: "Answer: By providing real-time object and field element information for decision-making."}
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
        {question: "1. How do you move a servo?", answer: "Answer: By setting its position between 0.0 and 1.0 using setPosition()."},
        {question: "2. What motor mode moves to a set position?", answer: "Answer: RUN_TO_POSITION mode."},
        {question: "3. Why use sensors on arms?", answer: "Answer: To detect limits and avoid mechanical damage."}
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
        {question: "1. Why is scouting important?", answer: "Answer: To understand other teams and plan alliances or counter strategies."},
        {question: "2. Name two key match strategies.", answer: "Answer: Maximizing autonomous scoring and practicing driver control."},
        {question: "3. How does communication help your team?", answer: "Answer: It ensures everyone knows their role and can adapt quickly."}
    ] 
  },
];

    