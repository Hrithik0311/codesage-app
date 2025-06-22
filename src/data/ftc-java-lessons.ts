
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
  content: LessonContentItem[];
  quiz: QuizItem[];
}

export const ftcJavaLessons: Lesson[] = [
  // =================================================================
  // BEGINNER SECTION
  // =================================================================
  {
    id: 'lesson1',
    title: '1. What is Java?',
    content: [
      {
        type: LessonContentType.SectionBreak,
        text: 'Beginner',
      },
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
        options: [
          'To make computers run faster.',
          'To write instructions for a computer to execute.',
          'To design computer hardware.',
          'To browse the internet.',
        ],
        correctAnswer: 'To write instructions for a computer to execute.',
        explanation: 'Programming languages provide a structured way for humans to give commands to computers.',
      },
      {
        question: 'In Java, where must all code be written?',
        options: [
          'Inside a method.',
          'Inside a variable.',
          'Inside a class.',
          'Inside a comment.',
        ],
        correctAnswer: 'Inside a class.',
        explanation: 'Java is class-based, so every program is structured around one or more classes.',
      },
      {
        question: 'Which character is used to end a statement in Java?',
        options: [
          'A period (.)',
          'A comma (,)',
          'A colon (:)',
          'A semicolon (;)',
        ],
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
        question: 'Which data type would you use to store a person\'s age in whole years?',
        options: [
          'String',
          'double',
          'int',
          'boolean'
        ],
        correctAnswer: 'int',
        explanation: '`int` is used for whole numbers, and age is typically represented as a whole number.',
      },
      {
        question: 'What are the only two possible values for a `boolean` variable?',
        options: [
          '`0` and `1`',
          '`"true"` and `"false"`',
          '`true` and `false`',
          '`yes` and `no`'
        ],
        correctAnswer: '`true` and `false`',
        explanation: 'Booleans are fundamental for logic and control flow, representing a binary choice.',
      },
      {
        question: 'How do you declare a variable to hold the text "FTC Robotics"?',
        options: [
          'String teamName = FTC Robotics;',
          'int teamName = "FTC Robotics";',
          'String teamName = "FTC Robotics";',
          'text teamName = "FTC Robotics";'
        ],
        correctAnswer: 'String teamName = "FTC Robotics";',
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
        options: ['3.75', '3', '4', '1'],
        correctAnswer: '3',
        explanation: 'The modulus operator (%) gives the remainder of a division. 15 divided by 4 is 3 with a remainder of 3.',
      },
      {
        question: 'Which operator is used to check if two values are equal?',
        options: ['=', '===', '!=', '=='],
        correctAnswer: '==',
        explanation: 'A single equals sign (`=`) is the assignment operator, used to set a variable\'s value. The double equals sign (`==`) is for comparison.',
      },
      {
        question: 'What is the result of `(5 > 3) && (10 < 5)`?',
        options: ['true', 'false', 'Error', '1'],
        correctAnswer: 'false',
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
        options: ['Always', 'Only when the `if` condition is false.', 'Only when the `if` condition is true.', 'Never'],
        correctAnswer: 'Only when the `if` condition is false.',
        explanation: 'The `if` and `else` blocks are mutually exclusive; one or the other will run, but never both.',
      },
      {
        question: 'Can you have an `else` statement without a preceding `if` statement?',
        options: ['Yes, always.', 'Yes, if you use `else if`.', 'No.', 'Only inside a method.'],
        correctAnswer: 'No.',
        explanation: 'An `else` statement is always linked to an `if` statement. It provides the alternative path for when the `if` condition is not met.',
      },
      {
        question: 'What is the purpose of `else if`?',
        options: ['To run code if two conditions are true.', 'To check multiple conditions in a sequence.', 'To end the program.', 'To repeat a block of code.'],
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
        options: ['To make the code run faster.', 'To use less memory.', 'To reuse code and keep it organized.', 'To make the code harder to read.'],
        correctAnswer: 'To reuse code and keep it organized.',
        explanation: 'Methods prevent you from having to write the same block of code over and over again, making your programs shorter and easier to manage.',
      },
      {
        question: 'What is a "parameter"?',
        options: ['A variable that is returned from a method.', 'A variable that passes data into a method.', 'A special type of class.', 'A comment in the code.'],
        correctAnswer: 'A variable that passes data into a method.',
        explanation: 'Parameters act as placeholders for values that you provide when you call the method, allowing the method to work with different data.',
      },
      {
        question: 'What does the `return` keyword do?',
        options: ['It stops the program entirely.', 'It prints a value to the screen.', 'It sends a value back from the method to the calling code.', 'It deletes a variable.'],
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
        options: ['They are the same thing.', 'An object is a blueprint for a class.', 'A class is a blueprint, and an object is an instance created from that blueprint.', 'A class is a type of variable.'],
        correctAnswer: 'A class is a blueprint, and an object is an instance created from that blueprint.',
        explanation: 'You define the structure and behavior in a class, and then you can create multiple objects, each with its own state, based on that class.',
      },
      {
        question: 'What keyword is used to create an object from a class?',
        options: ['create', 'instance', 'new', 'object'],
        correctAnswer: 'new',
        explanation: 'The `new` keyword allocates memory for a new object and returns a reference to it.',
      },
      {
        question: 'In FTC, if `DcMotor` is a class, what is `leftDrive` in the code `DcMotor leftDrive;`?',
        options: ['A method', 'A class', 'A variable that can hold a DcMotor object', 'A keyword'],
        correctAnswer: 'A variable that can hold a DcMotor object',
        explanation: '`leftDrive` is a variable declared to hold a reference to an instance of the `DcMotor` class. It will become an object reference after instantiation (e.g., `leftDrive = new ...`).',
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
        options: ['To start the robot moving.', 'To register the OpMode on the Driver Hub list.', 'To declare a new variable.', 'To connect to the Wi-Fi.'],
        correctAnswer: 'To register the OpMode on the Driver Hub list.',
        explanation: 'The `@TeleOp(...)` annotation tells the FTC app that this class is a runnable OpMode and defines the name and group that will appear on the selection screen.',
      },
      {
        question: 'Code placed BEFORE `waitForStart()` runs when you press...',
        options: ['PLAY', 'INIT', 'STOP', 'It doesn\'t run.'],
        correctAnswer: 'INIT',
        explanation: 'The section before `waitForStart()` is for initialization. It runs as soon as you select the OpMode and press the INIT button on the Driver Hub.',
      },
      {
        question: 'What does the `while (opModeIsActive())` loop do?',
        options: ['Runs the code inside it exactly once.', 'Checks if the OpMode has errors.', 'Repeats the code inside it until the driver presses STOP.', 'Initializes the hardware.'],
        correctAnswer: 'Repeats the code inside it until the driver presses STOP.',
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
        options: ['To get the battery voltage.', 'To retrieve a reference to a configured hardware device.', 'To start the robot.', 'To set the motor power.'],
        correctAnswer: 'To retrieve a reference to a configured hardware device.',
        explanation: 'The `hardwareMap.get()` method takes the device type (e.g., `DcMotor.class`) and its configured name to link your code variable to the physical device.',
      },
      {
        question: 'What happens if the name in `hardwareMap.get(DcMotor.class, "motor_a")` doesn\'t match the robot configuration?',
        options: ['The motor runs at half speed.', 'The code will crash when you press INIT.', 'Nothing, it will work fine.', 'The app will ask you to rename it.'],
        correctAnswer: 'The code will crash when you press INIT.',
        explanation: 'This is a very common error. If the hardware map cannot find a device with the exact name you provided, your OpMode will fail to initialize and the app will stop.',
      },
      {
        question: 'Where should you typically map your hardware?',
        options: ['After `waitForStart()`', 'In a separate file that you never use.', 'In the main run loop.', 'In the initialization section, before `waitForStart()`.'],
        correctAnswer: 'In the initialization section, before `waitForStart()`.',
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
        options: ['0 to 100', '-1.0 to 1.0', '0.0 to 1.0', '-100 to 100'],
        correctAnswer: '-1.0 to 1.0',
        explanation: 'Motor power is represented as a decimal from -1.0 (full reverse) to 1.0 (full forward), with 0 indicating the motor should stop.',
      },
      {
        question: 'What is the valid range for servo position values passed to `.setPosition()`?',
        options: ['-1.0 to 1.0', '0 to 180', '0.0 to 1.0', 'Any number'],
        correctAnswer: '0.0 to 1.0',
        explanation: 'A servo\'s position is set using a decimal value where 0.0 is one end of its range of motion and 1.0 is the other end.',
      },
      {
        question: 'What is the main difference between a motor and a servo?',
        options: ['Motors are stronger.', 'Servos are faster.', 'Motors provide continuous rotation, while servos move to specific positions.', 'Servos use less battery.'],
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
        options: ['To make the motor run backwards.', 'Because it\'s a syntax requirement.', 'Because gamepads consider "up" on the Y-axis to be a negative value.', 'To make the value an integer.'],
        correctAnswer: 'Because gamepads consider "up" on the Y-axis to be a negative value.',
        explanation: 'By convention for most controllers, pushing a joystick forward results in a negative Y value. We multiply by -1 so that pushing forward corresponds to positive motor power.',
      },
      {
        question: 'What data type does a button like `gamepad1.x` return?',
        options: ['int', 'double', 'String', 'boolean'],
        correctAnswer: 'boolean',
        explanation: 'Buttons are digital inputs; they are either pressed (`true`) or not pressed (`false`).',
      },
      {
        question: 'What is the value of `gamepad1.right_trigger` when it is not being pressed at all?',
        options: ['-1.0', '1.0', '0.0', 'false'],
        correctAnswer: '0.0',
        explanation: 'Triggers are analog, ranging from 0.0 (not pressed) to 1.0 (fully pressed).',
      },
    ],
  },
  // =================================================================
  // INTERMEDIATE SECTION
  // =================================================================
  {
    id: 'lesson11',
    title: '11. Using Sensors',
    content: [
      {
        type: LessonContentType.SectionBreak,
        text: 'Intermediate',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'Sensors are the eyes and ears of your robot. They allow it to perceive the world and react to it. We will cover three common types: Touch, Distance, and Color.',
      },
      { type: LessonContentType.Heading, text: 'Touch Sensor (Digital)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A touch sensor is a simple button. It tells you if it is currently being pressed or not. It returns a boolean value.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
TouchSensor touchSensor = hardwareMap.get(TouchSensor.class, "touch_sensor");

// In the loop
if (touchSensor.isPressed()) {
    telemetry.addData("Touch Sensor", "Pressed");
} else {
    telemetry.addData("Touch Sensor", "Not Pressed");
}`
      },
      { type: LessonContentType.Heading, text: 'Distance Sensor (Analog)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A distance sensor measures how far away an object is. It returns a `double` value, usually in a specific unit like centimeters or inches.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
DistanceSensor distanceSensor = hardwareMap.get(DistanceSensor.class, "distance_sensor");

// In the loop
double distance = distanceSensor.getDistance(DistanceUnit.INCH);
telemetry.addData("Distance (inch)", distance);`
      },
      { type: LessonContentType.Heading, text: 'Color Sensor (Analog)' },
      {
        type: LessonContentType.Paragraph,
        text: 'A color sensor detects the color of the surface below it by measuring the amount of Red, Green, and Blue (RGB) light reflected.',
      },
      {
        type: LessonContentType.Code,
        code: `// Initialization
ColorSensor colorSensor = hardwareMap.get(ColorSensor.class, "color_sensor");

// In the loop
int red = colorSensor.red();
int green = colorSensor.green();
int blue = colorSensor.blue();
telemetry.addData("Red", red);
telemetry.addData("Green", green);
telemetry.addData("Blue", blue);`
      }
    ],
    quiz: [
      {
        question: 'Which sensor would you use to detect if your robot has bumped into a wall?',
        options: ['Color Sensor', 'Distance Sensor', 'Touch Sensor', 'IMU'],
        correctAnswer: 'Touch Sensor',
        explanation: 'A touch sensor acts like a bumper, providing a simple true/false value when it makes contact with an object.'
      },
      {
        question: 'The method `distanceSensor.getDistance()` returns what data type?',
        options: ['int', 'boolean', 'String', 'double'],
        correctAnswer: 'double',
        explanation: 'Distance is a continuous measurement, so it is represented by a `double` (a number that can have decimal points).'
      },
      {
        question: 'If a color sensor is over a pure red line, which value would you expect to be the highest?',
        options: ['The `blue()` value', 'The `green()` value', 'The `red()` value', 'All values would be equal'],
        correctAnswer: 'The `red()` value',
        explanation: 'The sensor measures reflected light. A red surface will reflect mostly red light, so the red channel reading will be the strongest.'
      }
    ]
  },
  {
    id: 'lesson12',
    title: '12. Introduction to Encoders',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'For precise autonomous movement, you can\'t just rely on time. You need to know how far your motors have actually turned. This is where **encoders** come in.',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'An encoder is a sensor attached to a motor that reports how many "ticks" or "counts" it has rotated. By knowing the ticks per rotation and the wheel diameter, you can calculate the distance traveled.',
      },
      { type: LessonContentType.Heading, text: 'Using Encoders for Autonomous Driving' },
      {
        type: LessonContentType.Paragraph,
        text: 'The FTC SDK provides a special motor mode, `RUN_TO_POSITION`, that uses encoders to drive to a specific target tick count and then stop.'
      },
      {
        type: LessonContentType.Code,
        code: `// This code would be inside a method or runOpMode()

// 1. Reset the encoders to 0
leftDrive.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);
rightDrive.setMode(DcMotor.RunMode.STOP_AND_RESET_ENCODER);

// 2. Set the target position in ticks
int targetTicks = 1000; // Example target
leftDrive.setTargetPosition(targetTicks);
rightDrive.setTargetPosition(targetTicks);

// 3. Set the motors to RUN_TO_POSITION mode
leftDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);
rightDrive.setMode(DcMotor.RunMode.RUN_TO_POSITION);

// 4. Set a power and the motors will start moving
double speed = 0.5;
leftDrive.setPower(speed);
rightDrive.setPower(speed);

// 5. Loop until the motors reach the target
while (opModeIsActive() && leftDrive.isBusy() && rightDrive.isBusy()) {
    telemetry.addData("Path", "Driving to target");
    telemetry.update();
}

// 6. Stop the motors
leftDrive.setPower(0);
rightDrive.setPower(0);

// Optional: Turn off RUN_TO_POSITION
leftDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
rightDrive.setMode(DcMotor.RunMode.RUN_USING_ENCODER);
`
      }
    ],
    quiz: [
      {
        question: 'What is the main purpose of a motor encoder?',
        options: ['To make the motor spin faster', 'To measure the motor\'s temperature', 'To measure the distance the motor has rotated', 'To change the motor\'s direction'],
        correctAnswer: 'To measure the distance the motor has rotated',
        explanation: 'Encoders provide feedback on motor rotation, which is essential for accurate autonomous movements.'
      },
      {
        question: 'Which `RunMode` is used to make a motor drive to a specific encoder position?',
        options: ['RUN_USING_ENCODER', 'RUN_WITHOUT_ENCODER', 'STOP_AND_RESET_ENCODER', 'RUN_TO_POSITION'],
        correctAnswer: 'RUN_TO_POSITION',
        explanation: '`RUN_TO_POSITION` is a special mode where the motor controller itself handles moving to the target tick count you set.'
      },
      {
        question: 'What does the `isBusy()` method tell you?',
        options: ['If the OpMode is active', 'If the motor is currently moving towards its target position', 'If the gamepad buttons are being pressed', 'If the code has errors'],
        correctAnswer: 'If the motor is currently moving towards its target position',
        explanation: '`isBusy()` returns `true` as long as the motor has not yet reached the target set with `setTargetPosition()`. It is used to know when a movement is complete.'
      }
    ]
  },
  {
    id: 'lesson13',
    title: '13. Building a Hardware Class',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'As your robot gets more complex, putting all your hardware mapping in every OpMode becomes messy. A much cleaner approach is to create a dedicated **Hardware Class**.'
      },
      { type: LessonContentType.Heading, text: 'What is a Hardware Class?' },
      {
        type: LessonContentType.Paragraph,
        text: 'A hardware class is a single place where you declare all your robot\'s hardware components and initialize them. Your OpModes can then create an object of this class to get access to all the hardware.'
      },
      { type: LessonContentType.Heading, text: 'Example: `HardwareRobot.java`' },
      {
        type: LessonContentType.Code,
        code: `package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.HardwareMap;

public class HardwareRobot {
    // Declare all your hardware components
    public DcMotor leftDrive = null;
    public DcMotor rightDrive = null;
    
    // The init method takes the hardwareMap from the OpMode
    public void init(HardwareMap hwMap) {
        // Initialize all the hardware
        leftDrive  = hwMap.get(DcMotor.class, "left_drive");
        rightDrive = hwMap.get(DcMotor.class, "right_drive");
        
        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);
        
        leftDrive.setPower(0);
        rightDrive.setPower(0);
        
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
    
    // Create an instance of our hardware class
    HardwareRobot robot = new HardwareRobot();

    @Override
    public void runOpMode() {
        // Initialize the hardware by calling the init method
        robot.init(hardwareMap);

        waitForStart();

        while (opModeIsActive()) {
            double drive = -gamepad1.left_stick_y;
            robot.leftDrive.setPower(drive);
            robot.rightDrive.setPower(drive);
        }
    }
}`
      }
    ],
    quiz: [
      {
        question: 'What is the main advantage of using a hardware class?',
        options: ['It makes the robot drive faster.', 'It centralizes hardware initialization for easy reuse and maintenance.', 'It is required by the FTC rules.', 'It makes the code take up less memory.'],
        correctAnswer: 'It centralizes hardware initialization for easy reuse and maintenance.',
        explanation: 'By putting all hardware mapping in one class, you avoid duplicating code in every OpMode and make it easier to manage changes to your robot\'s configuration.'
      },
      {
        question: 'How does an OpMode get access to the `hardwareMap` to pass to the hardware class?',
        options: ['It creates a new `hardwareMap` object.', 'The `LinearOpMode` class provides it automatically.', 'It reads it from a text file.', 'It doesn\'t need the `hardwareMap`.'],
        correctAnswer: 'The `LinearOpMode` class provides it automatically.',
        explanation: 'When your OpMode class `extends LinearOpMode`, it inherits the `hardwareMap` variable, which is populated by the FTC SDK when you press INIT.'
      },
      {
        question: 'In the example, how do you access the left motor from the OpMode?',
        options: ['`leftDrive.setPower()`', '`HardwareRobot.leftDrive.setPower()`', '`robot.leftDrive.setPower()`', '`init.leftDrive.setPower()`'],
        correctAnswer: '`robot.leftDrive.setPower()`',
        explanation: '`robot` is the name of the object created from the `HardwareRobot` class, and `leftDrive` is a public member of that class, so you access it with `robot.leftDrive`.'
      }
    ]
  },
  {
    id: 'lesson14',
    title: '14. Simple Autonomous with State Machines',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'A **state machine** is a programming concept used to manage a sequence of actions. It\'s perfect for autonomous routines where the robot needs to do one thing, then the next, then the next.'
      },
      { type: LessonContentType.Heading, text: 'Defining States with `enum`' },
      {
        type: LessonContentType.Paragraph,
        text: 'An `enum` is a special data type that lets us define a set of constant values. We can use it to create clear, readable names for each step in our autonomous path.'
      },
      {
        type: LessonContentType.Code,
        code: `enum State {
    DRIVE_FORWARD,
    TURN_LEFT,
    DROP_PIXEL,
    STOP
}`
      },
      { type: LessonContentType.Heading, text: 'Implementing the State Machine' },
      {
        type: LessonContentType.Paragraph,
        text: 'In the run loop, we use a `switch` statement to execute code based on the current state. When an action is finished (e.g., a motor reaches its target), we change the state to the next one in the sequence.'
      },
      {
        type: LessonContentType.Code,
        code: `// In your OpMode, create a variable to hold the current state
State currentState = State.DRIVE_FORWARD;

// ... inside your while(opModeIsActive()) loop ...
switch (currentState) {
    case DRIVE_FORWARD:
        // Start driving forward to a target position
        // ...
        
        // Check if the drive is finished
        if (!leftDrive.isBusy()) {
            // It's done, so move to the next state
            currentState = State.TURN_LEFT;
            // And set up the motors for the turn
            // ...
        }
        break;

    case TURN_LEFT:
        // Check if the turn is finished
        if (!leftDrive.isBusy()) {
            currentState = State.DROP_PIXEL;
            // Code to drop pixel
            // ...
        }
        break;

    case DROP_PIXEL:
        // Maybe wait a second, then move to STOP state
        // ...
        currentState = State.STOP;
        break;

    case STOP:
        // Do nothing, the routine is over
        break;
}`
      }
    ],
    quiz: [
      {
        question: 'What is a "state machine" in programming?',
        options: ['A physical machine that runs code.', 'A way to manage a sequence of steps or behaviors.', 'A special type of motor.', 'A method for debugging code.'],
        correctAnswer: 'A way to manage a sequence of steps or behaviors.',
        explanation: 'A state machine is a model of computation that can be in one of a finite number of states. It\'s a powerful pattern for organizing code that has distinct phases.'
      },
      {
        question: 'What is the purpose of an `enum` in a state machine?',
        options: ['To count how many states there are.', 'To define a set of named constants for the states.', 'To perform mathematical calculations.', 'To store sensor values.'],
        correctAnswer: 'To define a set of named constants for the states.',
        explanation: 'Using an `enum` makes the code much more readable and less error-prone than using numbers (e.g., `state = 1`, `state = 2`).'
      },
      {
        question: 'In the example, how does the state machine move from `DRIVE_FORWARD` to `TURN_LEFT`?',
        options: ['After a 5-second timer runs out.', 'When the driver presses a button.', 'When the motors are no longer busy (i.e., they have reached their target).', 'It happens randomly.'],
        correctAnswer: 'When the motors are no longer busy (i.e., they have reached their target).',
        explanation: 'The condition `!leftDrive.isBusy()` checks for the completion of the encoder-driven movement, which triggers the transition to the next state.'
      }
    ]
  },
  {
    id: 'lesson15',
    title: '15. Mecanum Drive',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Mecanum wheels are special wheels that allow a robot to move in any direction: forward, backward, sideways (strafing), and turning, all at the same time. This is called **holonomic** motion.'
      },
      { type: LessonContentType.Heading, text: 'How it Works' },
      {
        type: LessonContentType.Paragraph,
        text: 'Each wheel has rollers mounted at a 45-degree angle. By spinning the wheels in different directions, some of the force goes forward/backward and some goes sideways. When these forces are combined correctly, the robot can move in any direction.'
      },
      { type: LessonContentType.Heading, text: 'Mecanum Drive Logic' },
      {
        type: LessonContentType.Paragraph,
        text: 'The core of mecanum drive control is a set of equations that mix the driver\'s inputs (forward, strafe, turn) into power values for each of the four motors.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop

double y = -gamepad1.left_stick_y;  // Forward/Backward
double x = gamepad1.left_stick_x;   // Strafe Left/Right
double rx = gamepad1.right_stick_x; // Turn Left/Right

// The math to calculate wheel powers
double frontLeftPower  = y + x + rx;
double backLeftPower   = y - x + rx;
double frontRightPower = y - x - rx;
double backRightPower  = y + x - rx;

// Mecanum drive often requires you to find the largest power value
// and scale all the other values down to prevent any wheel power
// from exceeding 1.0. This is called normalization.

// Find the maximum absolute power value
double max = Math.max(Math.abs(frontLeftPower), Math.abs(backLeftPower));
max = Math.max(max, Math.abs(frontRightPower));
max = Math.max(max, Math.abs(backRightPower));

// If the max power is greater than 1, scale all powers down
if (max > 1.0) {
    frontLeftPower  /= max;
    backLeftPower   /= max;
    frontRightPower /= max;
    backRightPower  /= max;
}

// Set the power on the motors
frontLeftMotor.setPower(frontLeftPower);
backLeftMotor.setPower(backLeftPower);
frontRightMotor.setPower(frontRightPower);
backRightMotor.setPower(backRightPower);
`
      }
    ],
    quiz: [
      {
        question: 'What is the main advantage of a mecanum drivetrain?',
        options: ['It is faster than a tank drive.', 'It can move sideways (strafe).', 'It uses fewer motors.', 'It is easier to build.'],
        correctAnswer: 'It can move sideways (strafe).',
        explanation: 'The ability to move in any direction without first turning (holonomic motion) is the key benefit of mecanum wheels.'
      },
      {
        question: 'In the example code, which gamepad stick controls turning?',
        options: ['Left Stick Y-axis', 'Left Stick X-axis', 'Right Stick Y-axis', 'Right Stick X-axis'],
        correctAnswer: 'Right Stick X-axis',
        explanation: 'The code assigns `gamepad1.right_stick_x` to the `rx` (rotation) variable, which is used in all four wheel power calculations for turning.'
      },
      {
        question: 'What is "normalization" in the context of mecanum drive code?',
        options: ['Setting all motors to the same power.', 'Reversing the direction of the motors.', 'Scaling all wheel powers down if any one of them is greater than 1.0.', 'Resetting the encoders.'],
        correctAnswer: 'Scaling all wheel powers down if any one of them is greater than 1.0.',
        explanation: 'Because the mixing equations can result in values greater than 1.0, normalization ensures that all calculated powers stay within the valid -1.0 to 1.0 range while maintaining the correct ratio of speeds.'
      }
    ]
  },
  // =================================================================
  // ADVANCED SECTION
  // =================================================================
  {
    id: 'lesson16',
    title: '16. Introduction to PID Control',
    content: [
       {
        type: LessonContentType.SectionBreak,
        text: 'Advanced',
      },
      {
        type: LessonContentType.Paragraph,
        text: 'PID is a powerful control loop algorithm used widely in industrial control systems and robotics. It stands for **Proportional, Integral, Derivative**. It\'s used to get a system (like a robot arm) to a target state smoothly and accurately, and to hold it there against external forces (like gravity).'
      },
      { type: LessonContentType.Heading, text: 'The Core Concepts' },
      {
        type: LessonContentType.List,
        items: [
          '<b>Proportional (P):</b> This is the main driving force. The further you are from your target, the more power you apply. `power = error * kP`, where `error = target - current`.',
          '<b>Integral (I):</b> This corrects for small, steady-state errors. It accumulates error over time. If your arm is slightly sagging below its target, the integral term will slowly build up, adding a bit more power to correct it.',
          '<b>Derivative (D):</b> This is the brakes. It looks at how fast you are approaching the target. If you are moving too quickly, it applies a counter-force to prevent overshooting.',
        ]
      },
      { type: LessonContentType.Heading, text: 'Simple P-Controller for an Arm' },
      {
        type: LessonContentType.Paragraph,
        text: 'A full PID controller is complex, but a simple P-controller is easy to implement and very effective for things like holding a robot arm at a specific encoder position.'
      },
      {
        type: LessonContentType.Code,
        code: `// Constants you need to "tune" or find through testing
double kP = 0.05; 
int armTargetPosition = 500; // Target encoder ticks

// Assume armMotor is your motor object
armMotor.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER); // We control power manually

// Inside the while(opModeIsActive()) loop
int currentPosition = armMotor.getCurrentPosition();
int error = armTargetPosition - currentPosition;

double power = error * kP;

// Limit the power to the valid -1.0 to 1.0 range
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
        question: 'What does the "P" in PID control stand for?',
        options: ['Power', 'Position', 'Proportional', 'Program'],
        correctAnswer: 'Proportional',
        explanation: 'The Proportional term applies a corrective force that is proportional to the current error.'
      },
      {
        question: 'In a P-controller, if your robot arm is far below its target, will the calculated power be high or low?',
        options: ['Low', 'High', 'Zero', 'It depends on the I term.'],
        correctAnswer: 'High',
        explanation: 'Power is calculated as `error * kP`. A large error (being far from the target) results in a large power value to move the arm quickly towards the target.'
      },
      {
        question: 'What is the primary purpose of the Derivative (D) term in a full PID controller?',
        options: ['To add extra power.', 'To correct for past errors.', 'To act as a brake and prevent overshooting the target.', 'To reset the encoders.'],
        correctAnswer: 'To act as a brake and prevent overshooting the target.',
        explanation: 'The D term looks at the rate of change of the error. If the error is decreasing quickly (i.e., you are approaching the target fast), it will apply a counter-force to slow you down.'
      }
    ]
  },
  {
    id: 'lesson17',
    title: '17. Introduction to the IMU',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'The **Inertial Measurement Unit (IMU)** is a sensor inside the control/expansion hub that measures the robot\'s orientation in 3D space. Its most common use is to get an accurate heading (angle) for the robot, which is crucial for making precise turns in autonomous mode.'
      },
      { type: LessonContentType.Heading, text: 'Initializing the IMU' },
      {
        type: LessonContentType.Paragraph,
        text: 'You initialize the IMU just like any other hardware component. It needs a set of parameters to define its behavior.'
      },
      {
        type: LessonContentType.Code,
        code: `// Declare the IMU object
private IMU imu;

// In initialization
// Retrieve the IMU from the hardware map
imu = hardwareMap.get(IMU.class, "imu");

// Define the IMU parameters
IMU.Parameters parameters = new IMU.Parameters(new RevHubOrientationOnRobot(
    RevHubOrientationOnRobot.LogoFacingDirection.UP,
    RevHubOrientationOnRobot.UsbFacingDirection.FORWARD));

// Initialize the IMU with the parameters
imu.initialize(parameters);`
      },
      { type: LessonContentType.Heading, text: 'Reading the Robot\'s Angle' },
      {
        type: LessonContentType.Paragraph,
        text: 'You can get the robot\'s current yaw (the angle on the flat plane) in your loop. This is extremely useful for making turns.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop
double yaw = imu.getRobotYawPitchRollAngles().getYaw(AngleUnit.DEGREES);

telemetry.addData("Yaw (Degrees)", yaw);
telemetry.update();`
      }
    ],
    quiz: [
      {
        question: 'What is the primary purpose of the IMU in FTC?',
        options: ['To measure distance', 'To detect colors', 'To measure the robot\'s orientation and angle', 'To control motors'],
        correctAnswer: 'To measure the robot\'s orientation and angle',
        explanation: 'The IMU is like a compass and level for your robot, providing data about which way it\'s facing and how it\'s tilted.'
      },
      {
        question: 'When initializing the IMU, what do the `LogoFacingDirection` and `UsbFacingDirection` parameters define?',
        options: ['The direction the robot should drive', 'The physical orientation of the control hub on your robot', 'The color of the REV Hub\'s LED', 'The Wi-Fi password'],
        correctAnswer: 'The physical orientation of the control hub on your robot',
        explanation: 'The IMU needs to know how it is mounted so it can report angles relative to the robot\'s frame instead of the hub\'s frame. You must set these parameters to match how your hub is physically placed.'
      },
      {
        question: 'Which method call gets the robot\'s heading on the flat playing field?',
        options: ['getPitch()', 'getRoll()', 'getYaw()', 'getAngle()'],
        correctAnswer: 'getYaw()',
        explanation: 'In standard aerospace terms, Yaw is rotation around the vertical axis (like a car turning left or right), Pitch is front-to-back tilt, and Roll is side-to-side tilt. For turning, we use Yaw.'
      }
    ]
  },
  {
    id: 'lesson18',
    title: '18. Introduction to AprilTags',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Computer vision is a huge part of modern robotics. In FTC, we can use **AprilTags**, which are like QR codes for robots. By detecting these tags on the field with a camera, the robot can determine its exact position and orientation.'
      },
      { type: LessonContentType.Heading, text: 'Setting up the AprilTag Processor' },
      {
        type: LessonContentType.Paragraph,
        text: 'The FTC SDK has a built-in processor for detecting AprilTags. You need to initialize it and link it to a camera.'
      },
      {
        type: LessonContentType.Code,
        code: `private AprilTagProcessor aprilTag;
private VisionPortal visionPortal;

// In initialization
aprilTag = new AprilTagProcessor.Builder().build();

visionPortal = new VisionPortal.Builder()
    .setCamera(hardwareMap.get(WebcamName.class, "Webcam 1"))
    .addProcessor(aprilTag)
    .build();
`
      },
      { type: LessonContentType.Heading, text: 'Getting Detection Data' },
      {
        type: LessonContentType.Paragraph,
        text: 'In your loop, you can get a list of all the AprilTags the camera currently sees. Each detection provides a wealth of information, including the tag\'s ID and its position relative to the camera.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside the while(opModeIsActive()) loop
List<AprilTagDetection> currentDetections = aprilTag.getDetections();

telemetry.addData("# AprilTags Detected", currentDetections.size());

// Loop through all the detections
for (AprilTagDetection detection : currentDetections) {
    if (detection.metadata != null) {
        telemetry.addData("Tag ID", detection.id);
        telemetry.addData("Tag Name", detection.metadata.name);
        telemetry.addData("Range", detection.ftcPose.range);
        telemetry.addData("Bearing", detection.ftcPose.bearing);
        telemetry.addData("Yaw", detection.ftcPose.yaw);
    }
}
telemetry.update();
`
      }
    ],
    quiz: [
      {
        question: 'What is an AprilTag?',
        options: ['A special type of motor', 'A tag that tells you the date', 'A visual marker, like a QR code, used for robot localization', 'A type of sensor'],
        correctAnswer: 'A visual marker, like a QR code, used for robot localization',
        explanation: 'AprilTags are visual fiducial markers that allow a robot\'s camera to determine its position and orientation relative to the tag.'
      },
      {
        question: 'What hardware is required to detect AprilTags?',
        options: ['A touch sensor', 'An IMU', 'A webcam or phone camera', 'A distance sensor'],
        correctAnswer: 'A webcam or phone camera',
        explanation: 'AprilTag detection is a computer vision task, which requires a camera to see the tags.'
      },
      {
        question: 'If `detection.ftcPose.range` gives you a value, what does that value represent?',
        options: ['The ID number of the tag', 'The color of the tag', 'How far away the tag is from the camera', 'The size of the tag'],
        correctAnswer: 'How far away the tag is from the camera',
        explanation: 'The `ftcPose` object contains useful information about the tag\'s position relative to the camera, including range (distance), bearing (angle left/right), and yaw (rotational difference).'
      }
    ]
  },
  {
    id: 'lesson19',
    title: '19. Advanced State Machines',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Our simple state machine works, but it can be brittle. What if a motor gets stuck and `isBusy()` never becomes false? The robot will be stuck in that state forever. We can improve our state machine with **timeouts** using the `ElapsedTime` class.'
      },
      { type: LessonContentType.Heading, text: 'The `ElapsedTime` Timer' },
      {
        type: LessonContentType.Paragraph,
        text: '`ElapsedTime` is a simple stopwatch. You can create a timer, reset it when a state begins, and then check how much time has passed.'
      },
      {
        type: LessonContentType.Code,
        code: `// Declare a timer at the top of your class
private ElapsedTime runtime = new ElapsedTime();

// When you enter a new state, reset the timer
private void enterNewState(State newState) {
    currentState = newState;
    runtime.reset();
    // ... setup motors for the new state ...
}`
      },
      { type: LessonContentType.Heading, text: 'State Machine with Timeouts' },
      {
        type: LessonContentType.Paragraph,
        text: 'Now, we can add a second condition to our state transitions. We move to the next state if the action is complete OR if a certain amount of time has passed. This prevents the robot from getting stuck.'
      },
      {
        type: LessonContentType.Code,
        code: `// Inside your state machine switch statement
case DRIVE_FORWARD:
    // Move to next state if finished OR if 5 seconds have passed
    if (!leftDrive.isBusy() || runtime.seconds() > 5.0) {
        // It's done, so move to the next state
        enterNewState(State.TURN_LEFT);
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
        options: ['It is too complicated.', 'It can get stuck in a state forever if the condition is never met.', 'It runs too slowly.', 'It uses too much battery.'],
        correctAnswer: 'It can get stuck in a state forever if the condition is never met.',
        explanation: 'If a motor is blocked or a sensor fails, a simple state machine might never receive the signal to transition, causing the autonomous routine to fail. Timeouts add robustness.'
      },
      {
        question: 'Which `ElapsedTime` method do you call to start the timer over from zero?',
        options: ['`start()`', '`getTime()`', '`reset()`', '`seconds()`'],
        correctAnswer: '`reset()`',
        explanation: '`runtime.reset()` sets the timer\'s internal start time to the current time, effectively restarting it.'
      },
      {
        question: 'What does the code `runtime.seconds() > 5.0` check for?',
        options: ['If the robot has driven 5 feet.', 'If the motor power is greater than 5.', 'If more than 5 seconds have passed since the timer was last reset.', 'If the driver has pressed button 5.'],
        correctAnswer: 'If more than 5 seconds have passed since the timer was last reset.',
        explanation: 'The `seconds()` method returns the elapsed time as a `double`. This condition acts as a failsafe, or a timeout, for the current state.'
      }
    ]
  },
  {
    id: 'lesson20',
    title: '20. Next Steps & Road Runner',
    content: [
      {
        type: LessonContentType.Paragraph,
        text: 'Congratulations! You have completed the core concepts of FTC Java programming. You now have the tools to build a competitive TeleOp and a reliable, multi-step autonomous routine.'
      },
      { type: LessonContentType.Heading, text: 'Where to Go From Here?' },
      {
        type: LessonContentType.Paragraph,
        text: 'The world of robotics is vast. The next level of FTC programming involves combining all these concepts and using more advanced libraries. The most popular and powerful of these is **Road Runner**.'
      },
      { type: LessonContentType.Heading, text: 'What is Road Runner?' },
      {
        type: LessonContentType.Paragraph,
        text: 'Road Runner is a motion planning library. Instead of telling your robot "drive forward 24 inches, then turn 90 degrees," you define a continuous path with curves and complex movements. Road Runner calculates the precise, coordinated wheel velocities needed to follow that path perfectly.'
      },
      {
        type: LessonContentType.List,
        items: [
            'It uses odometry (special unpowered tracking wheels) for hyper-accurate position tracking.',
            'It uses advanced feedforward and PID control on each wheel.',
            'It allows you to build complex, multi-step autonomous paths that are smooth, fast, and highly repeatable.'
        ]
      },
       { type: LessonContentType.Heading, text: 'Learning Road Runner' },
      {
        type: LessonContentType.Paragraph,
        text: 'Learning Road Runner is a project in itself. It requires careful robot build quality and a detailed tuning process. The official documentation at <a href="https://learnroadrunner.com" target="_blank" rel="noopener noreferrer" style="color:hsl(var(--accent));text-decoration:underline;">learnroadrunner.com</a> is the best place to start. What you\'ve learned in this course provides the foundation you need to understand and implement it.'
      }
    ],
    quiz: [
      {
        question: 'What is the primary function of the Road Runner library?',
        options: ['To analyze code for errors.', 'To provide advanced motion planning for smooth, complex paths.', 'To control servos.', 'To manage team collaboration.'],
        correctAnswer: 'To provide advanced motion planning for smooth, complex paths.',
        explanation: 'Road Runner is a specialized library for generating and following complex trajectories, which is a step beyond simple state-based autonomous routines.'
      },
      {
        question: 'What is "odometry" in the context of FTC?',
        options: ['A way to measure distance with a sensor.', 'Using special, unpowered wheels to track the robot\'s precise X and Y position.', 'The robot\'s orientation from the IMU.', 'A type of drivetrain.'],
        correctAnswer: 'Using special, unpowered wheels to track the robot\'s precise X and Y position.',
        explanation: 'Odometry wheels are not connected to motors. They are free-spinning wheels with encoders that are used purely for measurement, providing a much more accurate position estimate than motor encoders alone.'
      },
      {
        question: 'Is Road Runner a simple, drop-in replacement for a state machine?',
        options: ['Yes, it works automatically.', 'No, it is a complex library that requires significant setup and tuning.', 'It only works in TeleOp.', 'It is an older, outdated technology.'],
        correctAnswer: 'No, it is a complex library that requires significant setup and tuning.',
        explanation: 'While incredibly powerful, Road Runner is an advanced tool that requires a solid understanding of robotics concepts and a willingness to follow a detailed tuning process.'
      }
    ]
  }
];
