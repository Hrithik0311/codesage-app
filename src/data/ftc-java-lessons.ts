
export interface QuizItem {
  question: string;
  answer: string;
}

export enum LessonContentType {
  Heading = 'heading',
  Paragraph = 'paragraph',
  Code = 'code',
  List = 'list',
  YouTubeLink = 'youtubeLink',
  Iframe = 'iframe',
}

export interface LessonContentItem {
  type: LessonContentType;
  text?: string;
  code?: string;
  items?: string[];
  url?: string;
  title?: string; // For YouTubeLink title or Iframe title
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
        type: LessonContentType.YouTubeLink,
        title: 'Official FTC Programming Tutorials Playlist (YouTube)',
        url: 'https://www.youtube.com/playlist?list=PLuCJKJL12h-4TTbNqpY5Dy7EnOgph8ylT',
        text: 'Watch official FTC Java programming basics here:',
      },
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
        type: LessonContentType.Iframe,
        url: 'https://www.youtube.com/embed/Oqh0xFgYOqE',
        title: 'FTC OpModes Explained',
      },
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
  // Add other lessons here following the same structure...
  // For brevity, only the first two lessons are fully structured.
  // The following are placeholders to populate the navigation.
  { id: 'lesson3', title: 'Lesson 3: Motors & Movement', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson4', title: 'Lesson 4: Sensors & Input', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson5', title: 'Lesson 5: Gamepad Controls', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson6', title: 'Lesson 6: Autonomous Programming', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson7', title: 'Lesson 7: PID Control', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson8', title: 'Lesson 8: Computer Vision', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson9', title: 'Lesson 9: Advanced Mechanisms', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
  { id: 'lesson10', title: 'Lesson 10: Competition Strategies', content: [{type: LessonContentType.Paragraph, text:"Content coming soon."}], quiz: [] },
];
