
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export const fileTreeData: FileNode[] = [
  {
    name: "TeamCode",
    path: "TeamCode",
    type: "folder",
    children: [
      {
        name: "src",
        path: "TeamCode/src",
        type: "folder",
        children: [
          {
            name: "main",
            path: "TeamCode/src/main",
            type: "folder",
            children: [
              {
                name: "java",
                path: "TeamCode/src/main/java",
                type: "folder",
                children: [
                  {
                    name: "org",
                    path: "TeamCode/src/main/java/org",
                    type: "folder",
                    children: [
                      {
                        name: "firstinspires",
                        path: "TeamCode/src/main/java/org/firstinspires",
                        type: "folder",
                        children: [
                          {
                            name: "ftc",
                            path: "TeamCode/src/main/java/org/firstinspires/ftc",
                            type: "folder",
                            children: [
                              {
                                name: "teamcode",
                                path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode",
                                type: "folder",
                                children: [
                                  { name: "HardwareRobot.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/HardwareRobot.java", type: "file" },
                                  { name: "TeleOp.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/TeleOp.java", type: "file" },
                                  { name: "Autonomous.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/Autonomous.java", type: "file" },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      { name: "build.gradle", path: "TeamCode/build.gradle", type: "file" },
    ],
  },
  {
    name: "FtcRobotController",
    path: "FtcRobotController",
    type: "folder",
    children: [
      {
        name: "src",
        path: "FtcRobotController/src",
        type: "folder",
        children: [
          {
            name: "main",
            path: "FtcRobotController/src/main",
            type: "folder",
            children: [
              {
                name: "java",
                path: "FtcRobotController/src/main/java",
                type: "folder",
                children: [
                    { name: "org.firstinspires.ftc.robotcontroller", path: "FtcRobotController/src/main/java/org", type: "folder" }
                ],
              },
              {
                name: "res",
                path: "FtcRobotController/src/main/res",
                type: "folder",
              },
              { name: "AndroidManifest.xml", path: "FtcRobotController/src/main/AndroidManifest.xml", type: "file" },
            ],
          },
        ],
      },
      { name: "build.gradle", path: "FtcRobotController/build.gradle", type: "file" },
    ],
  },
  { name: ".gitignore", path: ".gitignore", type: "file" },
  { name: "README.md", path: "README.md", type: "file" },
  { name: "settings.gradle", path: "settings.gradle", type: "file" },
];

export const fileContentData = new Map<string, string>([
  [
    'TeamCode/src/main/java/org/firstinspires/ftc/teamcode/TeleOp.java',
`package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.DcMotor;

@TeleOp(name="Basic: Tank Drive", group="Linear Opmode")
public class BasicTankDrive extends LinearOpMode {

    private DcMotor leftDrive = null;
    private DcMotor rightDrive = null;

    @Override
    public void runOpMode() {
        leftDrive  = hardwareMap.get(DcMotor.class, "left_drive");
        rightDrive = hardwareMap.get(DcMotor.class, "right_drive");

        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);

        waitForStart();

        while (opModeIsActive()) {
            double leftPower;
            double rightPower;

            leftPower  = -gamepad1.left_stick_y;
            rightPower = -gamepad1.right_stick_y;

            leftDrive.setPower(leftPower);
            rightDrive.setPower(rightPower);

            telemetry.addData("Left", "%.2f", leftPower);
            telemetry.addData("Right", "%.2f", rightPower);
            telemetry.update();
        }
    }
}`
  ],
  [
    'TeamCode/src/main/java/org/firstinspires/ftc/teamcode/HardwareRobot.java',
`package org.firstinspires.ftc.teamcode;

import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;

public class HardwareRobot {
    public DcMotor  leftDrive   = null;
    public DcMotor  rightDrive  = null;

    HardwareMap hwMap = null;
    private ElapsedTime period  = new ElapsedTime();

    public HardwareRobot() {}

    public void init(HardwareMap ahwMap) {
        hwMap = ahwMap;
        leftDrive  = hwMap.get(DcMotor.class, "left_drive");
        rightDrive = hwMap.get(DcMotor.class, "right_drive");
        leftDrive.setDirection(DcMotor.Direction.FORWARD);
        rightDrive.setDirection(DcMotor.Direction.REVERSE);
        leftDrive.setPower(0);
        rightDrive.setPower(0);
        leftDrive.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
        rightDrive.setMode(DcMotor.RunMode.RUN_WITHOUT_ENCODER);
    }
}`
  ],
  [
    'README.md',
`# FTC Robot Controller
This is the repository for our team's robot code.

## Structure
- \`TeamCode\`: Contains all of our custom OpModes and classes.
- \`FtcRobotController\`: The core SDK module. Do not edit files here unless you know what you are doing.

## How to use
1. Clone this repository.
2. Open the project in Android Studio.
3. Build the 'TeamCode' module to the Robot Controller.`
  ],
  ['TeamCode/src/main/java/org/firstinspires/ftc/teamcode/Autonomous.java', '// Autonomous code will go here.'],
  ['TeamCode/build.gradle', '// TeamCode build script'],
  ['FtcRobotController/src/main/AndroidManifest.xml', '<!-- Android Manifest for Robot Controller -->'],
  ['FtcRobotController/build.gradle', '// FtcRobotController build script'],
  ['.gitignore', 'build/\n.idea/\n*.iml\nlocal.properties'],
  ['settings.gradle', '// Project settings'],
]);
