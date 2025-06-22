
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
    title: '1. What is Java?',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Welcome to your first lesson in programming! **Programming** is the process of writing instructions that a computer can understand and execute. We use programming languages to write these instructions. For FTC Robotics, the primary language is **Java**.',
      },
      { type: LessonContentType.Heading, text: 'Why Java?' },
      {
        type: LessonContentType.Paragraph,
        text: 'Java is a powerful, widely-used, and **object-oriented** programming language. This "object-oriented" nature makes it excellent for robotics, as you can model real-world robot parts (like motors, servos, and sensors) as "objects" in your code. This helps keep your programs organized and easy to understand.',
      },
      { type: LessonContentType.Heading, text: 'The Simplest Java Program' },
      {
        type: LessonContentType.Paragraph,
        text: 'Let\'s look at the classic "Hello, World!" program in Java. This is the traditional first program for anyone learning a new language.',
      },
      {
        type: LessonContentType.Code,
        code: `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Key Parts Explained' },
      {
        type: LessonContentType.List,
        items: [
          '<b><code>public class HelloWorld</code>:</b> In Java, all code lives inside a **class**. We\'ve named ours `HelloWorld`.',
          '<b><code>public static void main(String[] args)</code>:</b> This is the main **method**. A method is a block of code that runs when it is called. The `main` method is special—it\'s the entry point where the program starts executing.',
          '<b><code>System.out.println(...)</code>:</b> This is a built-in Java command that prints a line of text to the console.',
          '<b><code>;</code> (Semicolon):</b> Every statement in Java must end with a semicolon. It\'s like the period at the end of a sentence.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the main purpose of a programming language?',
        correctAnswer: 'To write instructions for a computer to execute.',
        explanation: 'Programming languages provide a structured way for humans to give commands to computers.',
      },
      {
        question: 'In Java, where must all code be written?',
        correctAnswer: 'Inside a class.',
        explanation: 'Java is class-based, so every program is structured around one or more classes.',
      },
      {
        question: 'Which character is used to end a statement in Java?',
        correctAnswer: 'A semicolon (;)',
        explanation: 'The semicolon is crucial for the Java compiler to understand where one instruction ends and the next begins.',
      },
    ],
  },
  {
    id: 'lesson2',
    title: '2. Variables & Data Types',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'A **variable** is a container for storing data values. In Java, you must declare the **type** of the variable, which tells the computer what kind of data it will hold.',
      },
      { type: LessonContentType.Heading, text: 'Declaring Variables' },
      {
        type: LessonContentType.Paragraph,
        text: 'To create a variable, you specify the type, give it a name, and optionally assign it an initial value.',
      },
      {
        type: LessonContentType.Code,
        code: `// Syntax: type variableName = value;

int myNumber = 5; // An integer (whole number)
double myDecimal = 5.99; // A floating-point number (decimal)
char myLetter = 'D'; // A single character
boolean isJavaFun = true; // A boolean (true or false)
String myText = "Hello"; // A string of text`,
      },
      { type: LessonContentType.Heading, text: 'Common Data Types' },
      {
        type: LessonContentType.List,
        items: [
          '<b><code>int</code>:</b> stores integers (whole numbers), like 123 or -456. Cannot have decimals.',
          '<b><code>double</code>:</b> stores floating-point numbers, with decimals, like 19.99 or -3.14.',
          '<b><code>boolean</code>:</b> stores one of two states: `true` or `false`. Very useful for making decisions.',
          '<b><code>String</code>:</b> stores text, such as "Hello World". String values are surrounded by double quotes.',
        ],
      },
      { type: LessonContentType.Heading, text: 'Using Variables' },
      {
        type: LessonContentType.Paragraph,
        text: 'Once a variable is declared, you can use it in your code. You can also change its value (unless it is declared as `final`).',
      },
      {
        type: LessonContentType.Code,
        code: `int score = 0; // Initial score
System.out.println(score); // Prints 0

score = 10; // Update the value
System.out.println(score); // Prints 10`,
      },
    ],
    quiz: [
      {
        question: 'Which data type would you use to store a person\'s age?',
        correctAnswer: 'int',
        explanation: '`int` is used for whole numbers, and age is typically represented as a whole number.',
      },
      {
        question: 'What are the only two possible values for a `boolean` variable?',
        correctAnswer: '`true` and `false`',
        explanation: 'Booleans are fundamental for logic and control flow, representing a binary choice.',
      },
      {
        question: 'How do you declare a variable to hold the text "FTC Robotics"?',
        correctAnswer: '`String teamName = "FTC Robotics";`',
        explanation: 'Text is stored in a `String` variable, and the value must be enclosed in double quotes.',
      },
    ],
  },
  {
    id: 'lesson3',
    title: '3. Operators',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Operators are special symbols that perform operations on variables and values.',
      },
      { type: LessonContentType.Heading, text: 'Arithmetic Operators' },
      {
        type: LessonContentType.Paragraph,
        text: 'These are used to perform common mathematical calculations.',
      },
      {
        type: LessonContentType.Code,
        code: `int x = 10;
int y = 4;

System.out.println(x + y); // Addition: 14
System.out.println(x - y); // Subtraction: 6
System.out.println(x * y); // Multiplication: 40
System.out.println(x / y); // Division: 2 (integer division truncates the decimal)
System.out.println(x % y); // Modulus (remainder): 2`,
      },
      { type: LessonContentType.Heading, text: 'Comparison Operators' },
      {
        type: LessonContentType.Paragraph,
        text: 'These are used to compare two values and they always result in a `boolean` (`true` or `false`).',
      },
      {
        type: LessonContentType.List,
        items: [
          '`==` (Equal to)',
          '`!=` (Not equal to)',
          '`>` (Greater than)',
          '`<` (Less than)',
          '`>=` (Greater than or equal to)',
          '`<=` (Less than or equal to)',
        ],
      },
      { type: LessonContentType.Heading, text: 'Logical Operators' },
      {
        type: LessonContentType.Paragraph,
        text: 'These are used to combine boolean expressions.',
      },
      {
        type: LessonContentType.List,
        items: [
          '`&&` (Logical AND): returns `true` if both statements are true.',
          '`||` (Logical OR): returns `true` if at least one statement is true.',
          '`!` (Logical NOT): reverses the result, returns `false` if the result is true.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the result of the expression `15 % 4`?',
        correctAnswer: '3',
        explanation: 'The modulus operator (%) gives the remainder of a division. 15 divided by 4 is 3 with a remainder of 3.',
      },
      {
        question: 'Which operator is used to check if two values are equal?',
        correctAnswer: '`==` (double equals)',
        explanation: 'A single equals sign (`=`) is the assignment operator, used to set a variable\'s value. The double equals sign (`==`) is for comparison.',
      },
      {
        question: 'What is the result of `(5 > 3) && (10 < 5)`?',
        correctAnswer: '`false`',
        explanation: 'The first part `(5 > 3)` is true, but the second part `(10 < 5)` is false. Since the logical AND (`&&`) requires both sides to be true, the final result is false.',
      },
    ],
  },
  {
    id: 'lesson4',
    title: '4. Control Flow: If-Else',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'So far, our code has executed from top to bottom. **Control Flow** statements allow us to make decisions and execute different blocks of code based on certain conditions.',
      },
      { type: LessonContentType.Heading, text: 'The `if` Statement' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `if` statement executes a block of code only if a specified condition is true.',
      },
      {
        type: LessonContentType.Code,
        code: `int score = 100;
if (score > 90) {
    System.out.println("Excellent score!");
}`,
      },
      { type: LessonContentType.Heading, text: 'The `else` Statement' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `else` statement executes a block of code if the condition in the `if` statement is false.',
      },
      {
        type: LessonContentType.Code,
        code: `int time = 20;
if (time < 18) {
    System.out.println("Good day.");
} else {
    System.out.println("Good evening.");
}`,
      },
      { type: LessonContentType.Heading, text: 'The `else if` Statement' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `else if` statement allows you to check for a new condition if the first condition was false.',
      },
      {
        type: LessonContentType.Code,
        code: `int temperature = 22;
if (temperature > 30) {
    System.out.println("It's a hot day.");
} else if (temperature > 20) {
    System.out.println("It's a beautiful day.");
} else {
    System.out.println("It's a cold day.");
}`,
      },
    ],
    quiz: [
      {
        question: 'In an `if-else` statement, when does the code inside the `else` block run?',
        correctAnswer: 'Only when the `if` condition is false.',
        explanation: 'The `if` and `else` blocks are mutually exclusive; one or the other will run, but never both.',
      },
      {
        question: 'Can you have an `else` statement without a preceding `if` statement?',
        correctAnswer: 'No.',
        explanation: 'An `else` statement is always linked to an `if` statement. It provides the alternative path for when the `if` condition is not met.',
      },
      {
        question: 'What is the purpose of `else if`?',
        correctAnswer: 'To check multiple conditions in a sequence.',
        explanation: 'It allows you to create a chain of checks. The first one that evaluates to true will execute its block, and the rest are skipped.',
      },
    ],
  },
  {
    id: 'lesson5',
    title: '5. Methods',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'A **method** is a block of code which only runs when it is called. You can pass data, known as parameters, into a method. Methods are used to perform certain actions, and they are also known as **functions**.',
      },
      { type: LessonContentType.Heading, text: 'Why Use Methods?' },
      {
        type: LessonContentType.List,
        items: [
          '**Reusability:** Write the code once and use it many times.',
          '**Organization:** Break down complex problems into smaller, manageable pieces.',
        ],
      },
      { type: LessonContentType.Heading, text: 'Creating and Calling a Method' },
      {
        type: LessonContentType.Code,
        code: `public class Main {
    // This is the method definition
    static void myMethod() {
        System.out.println("I just got executed!");
    }

    public static void main(String[] args) {
        myMethod(); // This is the method call
        myMethod(); // You can call it multiple times
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Parameters and Return Values' },
      {
        type: LessonContentType.Paragraph,
        text: 'You can send information to methods as **parameters**. Methods can also **return** a value back to the code that called it.',
      },
      {
        type: LessonContentType.Code,
        code: `public class Main {
    // This method takes two int parameters and returns their sum
    static int add(int x, int y) {
        return x + y;
    }

    public static void main(String[] args) {
        int result = add(5, 3); // Call the method and store the returned value
        System.out.println(result); // Prints 8
    }
}`,
      },
    ],
    quiz: [
      {
        question: 'What is the primary benefit of using methods in your code?',
        correctAnswer: 'To reuse code and keep it organized.',
        explanation: 'Methods prevent you from having to write the same block of code over and over again, making your programs shorter and easier to manage.',
      },
      {
        question: 'What is a "parameter"?',
        correctAnswer: 'A variable that passes data into a method.',
        explanation: 'Parameters act as placeholders for values that you provide when you call the method, allowing the method to work with different data.',
      },
      {
        question: 'What does the `return` keyword do?',
        correctAnswer: 'It sends a value back from the method to the calling code.',
        explanation: 'A method with a return type (like `int` or `String`) must use `return` to give a result back. A method with `void` return type does not return a value.',
      },
    ],
  },
  {
    id: 'lesson6',
    title: '6. Classes and Objects',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Java is an **Object-Oriented Programming (OOP)** language. The core concepts of OOP are **classes** and **objects**.',
      },
      {
        type: LessonContentType.List,
        items: [
          'A **Class** is a blueprint or template for creating objects.',
          'An **Object** is an instance of a class.',
        ],
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Think of a `Car` class. The blueprint would define that a car has attributes (like `color` and `maxSpeed`) and methods (like `drive()` and `brake()`). An individual car, like a "red Ferrari," would be an object created from that `Car` class.',
      },
      { type: LessonContentType.Heading, text: 'Creating a Class' },
      {
        type: LessonContentType.Code,
        code: `public class Dog {
    // Attribute (variable)
    String breed;

    // Method
    public void bark() {
        System.out.println("Woof!");
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Creating an Object' },
      {
        type: LessonContentType.Paragraph,
        text: 'To create an object from a class, you use the `new` keyword. This is called **instantiation**.',
      },
      {
        type: LessonContentType.Code,
        code: `public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog(); // Create a Dog object
        myDog.breed = "Golden Retriever"; // Set its attribute

        System.out.println(myDog.breed); // Access the attribute
        myDog.bark(); // Call the method
    }
}`,
      },
      {
        type: LessonContentType.Paragraph,
        text: 'In FTC, you don\'t create the `DcMotor` class, but you create `DcMotor` *objects* to represent the actual motors on your robot!',
      },
    ],
    quiz: [
      {
        question: 'What is the relationship between a class and an object?',
        correctAnswer: 'A class is a blueprint, and an object is an instance created from that blueprint.',
        explanation: 'You define the structure and behavior in a class, and then you can create multiple objects, each with its own state, based on that class.',
      },
      {
        question: 'What keyword is used to create an object from a class?',
        correctAnswer: '`new`',
        explanation: 'The `new` keyword allocates memory for a new object and returns a reference to it.',
      },
      {
        question: 'In FTC, if `DcMotor` is a class, what is `leftDrive` in the code `DcMotor leftDrive = new DcMotor();`?',
        correctAnswer: 'An object.',
        explanation: '`leftDrive` is an instance of the `DcMotor` class, representing a specific motor on your robot.',
      },
    ],
  },
  {
    id: 'lesson7',
    title: '7. Your First FTC OpMode',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Now let\'s apply our Java knowledge to FTC! Every robot program you write is an **OpMode**. The simplest type is a `LinearOpMode`.',
      },
      { type: LessonContentType.Heading, text: 'The `LinearOpMode` Structure' },
      {
        type: LessonContentType.Paragraph,
        text: 'A `LinearOpMode` runs from top to bottom. It has one main method, `runOpMode()`, which is split into two phases: **Initialization** and the **Run Loop**.',
      },
      {
        type: LessonContentType.Code,
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;

@TeleOp(name="Basic: Linear OpMode")
public class BasicOpMode_Linear extends LinearOpMode {

    @Override
    public void runOpMode() {
        // Code here runs during the INIT phase
        telemetry.addData("Status", "Initialized");
        telemetry.update();

        // Wait for the game to start (driver presses PLAY)
        waitForStart();

        // The main run loop, continues until driver presses STOP
        while (opModeIsActive()) {
            telemetry.addData("Status", "Running");
            telemetry.update();

            // The loop repeats here
        }
    }
}`,
      },
      { type: LessonContentType.Heading, text: 'Key Parts Explained' },
      {
        type: LessonContentType.List,
        items: [
          '<b><code>@TeleOp(...)</code>:</b> This is an *annotation* that registers your OpMode so it appears in the list on the Driver Hub.',
          '<b><code>public class ... extends LinearOpMode</code>:</b> This declares your class. By *extending* `LinearOpMode`, your class inherits all the basic FTC functionality.',
          '<b><code>runOpMode()</code>:</b> This is the main method where your code lives.',
          '<b><code>waitForStart()</code>:</b> This is a critical line! Code before this runs when you press **INIT**. The code after it only runs after the driver presses **PLAY**.',
          '<b><code>while (opModeIsActive())</code>:</b> This is the main loop. Code inside this block will repeat over and over again until the driver presses **STOP**.',
        ],
      },
    ],
    quiz: [
      {
        question: 'What is the purpose of the `@TeleOp` annotation?',
        correctAnswer: 'To register the OpMode on the Driver Hub list',
        explanation: 'The `@TeleOp(...)` annotation tells the FTC app that this class is a runnable OpMode and defines the name and group that will appear on the selection screen.',
      },
      {
        question: 'Code placed BEFORE `waitForStart()` runs when you press...',
        correctAnswer: 'INIT',
        explanation: 'The section before `waitForStart()` is for initialization. It runs as soon as you select the OpMode and press the INIT button on the Driver Hub.',
      },
      {
        question: 'What does the `while (opModeIsActive())` loop do?',
        correctAnswer: 'Repeats the code inside it until the driver presses STOP',
        explanation: 'This is the main run loop. `opModeIsActive()` is `true` after PLAY is pressed and becomes `false` when STOP is pressed, ending the loop.',
      },
    ],
  },
  {
    id: 'lesson8',
    title: '8. Hardware Mapping',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'To control your robot, your code needs to know about its physical parts. This is done through the `hardwareMap`.',
      },
      { type: LessonContentType.Heading, text: 'The Hardware Map' },
      {
        type: LessonContentType.Paragraph,
        text: 'The `hardwareMap` is an object provided by the FTC SDK that acts as a bridge between your software and the robot\'s configured hardware. You use it to get references to specific motors, servos, and sensors.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'It is **critical** that the text name you use in the code (e.g., `"left_drive"`) **exactly matches** the name you gave that component in the Robot Configuration screen on the Robot Controller.',
      },
      {
        type: LessonContentType.Code,
        code: `// At the top of your OpMode class, declare variables for your hardware
private DcMotor leftDrive = null;
private DcMotor rightDrive = null;

@Override
public void runOpMode() {
    // In the INIT section, before waitForStart()
    leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
    rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

    // ... rest of your initialization
}`,
      },
      { type: LessonContentType.Heading, text: 'Good Practice: The Hardware Class' },
      {
        type: LessonContentType.Paragraph,
        text: 'Instead of declaring all your hardware in every OpMode, it is common practice to create a separate `Hardware` class to handle all initialization. This makes your code cleaner, more organized, and easier to maintain.',
      },
    ],
    quiz: [
      {
        question: 'What is the purpose of `hardwareMap.get()`?',
        correctAnswer: 'To retrieve a reference to a configured hardware device',
        explanation: 'The `hardwareMap.get()` method takes the device type (e.g., `DcMotor.class`) and its configured name to link your code variable to the physical device.',
      },
      {
        question: 'What happens if the name in `hardwareMap.get(DcMotor.class, "motor_a")` doesn\'t match the robot configuration?',
        correctAnswer: 'The code will crash when you press INIT',
        explanation: 'This is a very common error. If the hardware map cannot find a device with the exact name you provided, your OpMode will fail to initialize and the app will stop.',
      },
      {
        question: 'Where should you typically map your hardware?',
        correctAnswer: 'In the initialization section, before `waitForStart()`',
        explanation: 'Hardware mapping is a setup task that only needs to be done once, so it belongs in the INIT phase of your OpMode.',
      },
    ],
  },
  {
    id: 'lesson9',
    title: '9. Controlling Motors & Servos',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Motors and servos are the most common actuators on an FTC robot. Let\'s learn how to control them.',
      },
      { type: LessonContentType.Heading, text: 'Controlling Motors' },
      {
        type: LessonContentType.Paragraph,
        text: 'Motor power is set with a value from **-1.0** (full power reverse) to **+1.0** (full power forward). A value of **0** is stop. On a standard drivetrain, you usually need to reverse one side.',
      },
      {
        type: LessonContentType.Code,
        code: `// In your initialization
leftDrive.setDirection(DcMotor.Direction.FORWARD);
rightDrive.setDirection(DcMotor.Direction.REVERSE); // This motor is mounted backwards

// ... in your run loop ...
double drivePower = 0.5;
leftDrive.setPower(drivePower);
rightDrive.setPower(drivePower);`,
      },
      { type: LessonContentType.Heading, text: 'Controlling Servos' },
      {
        type: LessonContentType.Paragraph,
        text: 'Servos move to a specific position and hold it. This position is set with a value from **0.0** to **1.0**, which represents the servo\'s full range of motion.',
      },
      {
        type: LessonContentType.Code,
        code: `// Assume you have an 'armServo' mapped
// Define constants for your positions
static final double ARM_UP_POS = 0.8;
static final double ARM_DOWN_POS = 0.2;

// In your run loop
if (gamepad1.a) {
    armServo.setPosition(ARM_UP_POS);
} else if (gamepad1.b) {
    armServo.setPosition(ARM_DOWN_POS);
}`,
      },
    ],
    quiz: [
      {
        question: 'What is the valid range for motor power values passed to `.setPower()`?',
        correctAnswer: '-1.0 to 1.0',
        explanation: 'Motor power is represented as a decimal from -1.0 (full reverse) to 1.0 (full forward), with 0 indicating the motor should stop.',
      },
      {
        question: 'What is the valid range for servo position values passed to `.setPosition()`?',
        correctAnswer: '0.0 to 1.0',
        explanation: 'A servo\'s position is set using a decimal value where 0.0 is one end of its range of motion and 1.0 is the other end.',
      },
      {
        question: 'What is the main difference between a motor and a servo?',
        correctAnswer: 'Motors provide continuous rotation, while servos move to specific positions.',
        explanation: 'You set a "power" for a motor to make it spin, but you set a "position" for a servo to make it move to and hold a specific angle.',
      },
    ],
  },
  {
    id: 'lesson10',
    title: '10. Reading Gamepad Inputs',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Drivers control the robot using gamepads. The FTC SDK provides `gamepad1` and `gamepad2` to read their inputs inside the main run loop.',
      },
      { type: LessonContentType.Heading, text: 'Joystick, Button, and Trigger Inputs' },
      {
        type: LessonContentType.List,
        items: [
          '<b>Joysticks:</b> Return decimal values (`double`) from -1.0 to 1.0. Example: `gamepad1.left_stick_y`',
          '<b>Buttons:</b> Return boolean values (`true` or `false`). Example: `gamepad1.a`',
          '<b>Triggers:</b> Return decimal values (`double`) from 0.0 to 1.0. Example: `gamepad1.right_trigger`',
        ],
      },
      { type: LessonContentType.Heading, text: 'Tank Drive Example' },
      {
        type: LessonContentType.Paragraph,
        text: 'Tank drive is a common control scheme where each joystick controls one side of the robot.',
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop

// The Y-axis on a gamepad is inverted; up is negative.
// So we negate it to make up positive.
double leftPower = -gamepad1.left_stick_y;
double rightPower = -gamepad1.right_stick_y;

// Send calculated power to wheels
leftDrive.setPower(leftPower);
rightDrive.setPower(rightPower);

// Show the power values on the Driver Hub
telemetry.addData("Left Power", leftPower);
telemetry.addData("Right Power", rightPower);
telemetry.update();`,
      },
    ],
    quiz: [
      {
        question: 'In the code `double y = -gamepad1.left_stick_y;`, why is the value often negated?',
        correctAnswer: 'Because gamepads consider "up" on the Y-axis to be a negative value.',
        explanation: 'By convention for most controllers, pushing a joystick forward results in a negative Y value. We multiply by -1 so that pushing forward corresponds to positive motor power.',
      },
      {
        question: 'What data type does a button like `gamepad1.x` return?',
        correctAnswer: '`boolean`',
        explanation: 'Buttons are digital inputs; they are either pressed (`true`) or not pressed (`false`).',
      },
      {
        question: 'What is the value of `gamepad1.right_trigger` when it is not being pressed at all?',
        correctAnswer: '0.0',
        explanation: 'Triggers are analog, ranging from 0.0 (not pressed) to 1.0 (fully pressed).',
      },
    ],
  },
];
