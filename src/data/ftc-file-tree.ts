
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

export const fileTreeData: FileNode[] = [
  {
    name: ".git",
    path: ".git",
    type: "folder",
    children: [
      {
        name: "hooks",
        path: ".git/hooks",
        type: "folder",
        children: [
          { name: "commit-msg.sample", path: ".git/hooks/commit-msg.sample", type: "file" }
        ]
      },
      {
        name: "info",
        path: ".git/info",
        type: "folder",
        children: [
          { name: "exclude", path: ".git/info/exclude", type: "file" }
        ]
      },
      { name: "COMMIT_EDITMSG", path: ".git/COMMIT_EDITMSG", type: "file" },
      { name: "config", path: ".git/config", type: "file" },
      { name: "description", path: ".git/description", type: "file" },
      { name: "HEAD", path: ".git/HEAD", type: "file" },
      { name: "index", path: ".git/index", type: "file" },
    ]
  },
  {
    name: ".github",
    path: ".github",
    type: "folder",
    children: [
      { name: "CONTRIBUTING.md", path: ".github/CONTRIBUTING.md", type: "file" },
      { name: "PULL_REQUEST_TEMPLATE.md", path: ".github/PULL_REQUEST_TEMPLATE.md", type: "file" },
    ]
  },
  { name: ".gitignore", path: ".gitignore", type: "file" },
  {
    name: "FtcRobotController",
    path: "FtcRobotController",
    type: "folder",
    children: [
      { name: "build.gradle", path: "FtcRobotController/build.gradle", type: "file" },
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
              { name: "AndroidManifest.xml", path: "FtcRobotController/src/main/AndroidManifest.xml", type: "file" },
              {
                name: "java",
                path: "FtcRobotController/src/main/java",
                type: "folder",
                children: [
                  {
                    name: "org",
                    path: "FtcRobotController/src/main/java/org",
                    type: "folder",
                    children: [
                      {
                        name: "firstinspires",
                        path: "FtcRobotController/src/main/java/org/firstinspires",
                        type: "folder",
                        children: [
                          {
                            name: "ftc",
                            path: "FtcRobotController/src/main/java/org/firstinspires/ftc",
                            type: "folder",
                            children: [
                              {
                                name: "robotcontroller",
                                path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller",
                                type: "folder",
                                children: [
                                  {
                                    name: "external",
                                    path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external",
                                    type: "folder",
                                    children: [
                                      {
                                        name: "samples",
                                        path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples",
                                        type: "folder",
                                        children: [
                                          { name: "BasicOpMode_Linear.java", path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOpMode_Linear.java", type: "file" },
                                          { name: "ConceptAprilTag.java", path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/ConceptAprilTag.java", type: "file" },
                                          { name: "RobotHardware.java", path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotHardware.java", type: "file" },
                                        ]
                                      }
                                    ]
                                  },
                                  {
                                    name: "internal",
                                    path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/internal",
                                    type: "folder",
                                    children: [
                                      { name: "FtcRobotControllerActivity.java", path: "FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/internal/FtcRobotControllerActivity.java", type: "file" },
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ],
              },
              {
                name: "res",
                path: "FtcRobotController/src/main/res",
                type: "folder",
                children: [
                  {
                    name: "layout",
                    path: "FtcRobotController/src/main/res/layout",
                    type: "folder",
                    children: [
                      { name: "activity_ftc_controller.xml", path: "FtcRobotController/src/main/res/layout/activity_ftc_controller.xml", type: "file" }
                    ]
                  },
                  {
                    name: "menu",
                    path: "FtcRobotController/src/main/res/menu",
                    type: "folder",
                    children: [
                      { name: "ftc_robot_controller.xml", path: "FtcRobotController/src/main/res/menu/ftc_robot_controller.xml", type: "file" }
                    ]
                  },
                  {
                    name: "values",
                    path: "FtcRobotController/src/main/res/values",
                    type: "folder",
                    children: [
                      { name: "strings.xml", path: "FtcRobotController/src/main/res/values/strings.xml", type: "file" }
                    ]
                  },
                  {
                    name: "xml",
                    path: "FtcRobotController/src/main/res/xml",
                    type: "folder",
                    children: [
                      { name: "device_filter.xml", path: "FtcRobotController/src/main/res/xml/device_filter.xml", type: "file" }
                    ]
                  }
                ]
              },
            ],
          },
        ],
      },
    ],
  },
  { name: "LICENSE", path: "LICENSE", type: "file" },
  { name: "README.md", path: "README.md", type: "file" },
  {
    name: "TeamCode",
    path: "TeamCode",
    type: "folder",
    children: [
      { name: "build.gradle", path: "TeamCode/build.gradle", type: "file" },
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
              { name: "AndroidManifest.xml", path: "TeamCode/src/main/AndroidManifest.xml", type: "file" },
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
                                  { name: "Autonomous.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/Autonomous.java", type: "file" },
                                  { name: "HardwareRobot.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/HardwareRobot.java", type: "file" },
                                  { name: "TeleOp.java", path: "TeamCode/src/main/java/org/firstinspires/ftc/teamcode/TeleOp.java", type: "file" },
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
    ],
  },
  { name: "build.common.gradle", path: "build.common.gradle", type: "file" },
  { name: "build.dependencies.gradle", path: "build.dependencies.gradle", type: "file" },
  { name: "build.gradle", path: "build.gradle", type: "file" },
  {
    name: "gradle",
    path: "gradle",
    type: "folder",
    children: [
      {
        name: "wrapper",
        path: "gradle/wrapper",
        type: "folder",
        children: [
          { name: "gradle-wrapper.properties", path: "gradle/wrapper/gradle-wrapper.properties", type: "file" }
        ]
      }
    ]
  },
  { name: "gradle.properties", path: "gradle.properties", type: "file" },
  { name: "gradlew", path: "gradlew", type: "file" },
  { name: "gradlew.bat", path: "gradlew.bat", type: "file" },
  { name: "local.properties", path: "local.properties", type: "file" },
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
  ['.git/hooks/commit-msg.sample', `#!/bin/sh\n#\n# An example hook script to check the commit log message.\n# Called by "git commit" with one argument, the name of the file\n# that has the commit message.\n# The hook should exit with non-zero status after issuing\n# an appropriate message if it wants to stop the commit.\n#\n# To enable this hook, rename this file to "commit-msg".`],
  ['.git/info/exclude', `# git ls-files --others --exclude-from=.git/info/exclude\n# Lines that begin with '#' are comments.\n# For a project's shared ignore rules, see .gitignore.\n.idea/`],
  ['.git/COMMIT_EDITMSG', ''],
  ['.git/config', `[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true`],
  ['.git/description', "Unnamed repository; edit this file 'description' to name the repository.\n"],
  ['.git/HEAD', 'ref: refs/heads/main\n'],
  ['.git/index', '// Binary Git index file. Stores staging area information.'],
  ['.github/CONTRIBUTING.md', '# Contributing\n\nWhen contributing to this repository, please first discuss the change you wish to make via issue, email, or any other method with the owners of this repository before making a change.\n'],
  ['.github/PULL_REQUEST_TEMPLATE.md', '## Description\n\nClearly describe the changes you are making.\n\n## Related Issues\n\n- Closes #issue_number\n'],
  ['.gitignore', `# Gradle files\n.gradle\nbuild/\n\n# IDE files\n.idea/\n*.iml\n\n# Local configuration\nlocal.properties\n`],
  ['FtcRobotController/build.gradle', `// Top-level build file for FtcRobotController module.\n\napply plugin: 'com.android.library'\n\nandroid {\n    // ... Android configuration\n}`],
  ['FtcRobotController/src/main/AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.qualcomm.ftcrobotcontroller">\n    <application />\n</manifest>\n`],
  ['FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/BasicOpMode_Linear.java', `// Sample Basic Linear OpMode\npackage org.firstinspires.ftc.robotcontroller.external.samples;\n// ... imports\npublic class BasicOpMode_Linear extends LinearOpMode {\n    @Override\n    public void runOpMode() {\n        // ...\n    }\n}`],
  ['FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/ConceptAprilTag.java', `// Sample AprilTag Concept OpMode\npackage org.firstinspires.ftc.robotcontroller.external.samples;\n// ... imports\npublic class ConceptAprilTag extends LinearOpMode {\n    @Override\n    public void runOpMode() {\n        // ...\n    }\n}`],
  ['FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/external/samples/RobotHardware.java', `// Sample Hardware Class\npackage org.firstinspires.ftc.robotcontroller.external.samples;\n// ... imports\npublic class RobotHardware {\n    // ...\n}`],
  ['FtcRobotController/src/main/java/org/firstinspires/ftc/robotcontroller/internal/FtcRobotControllerActivity.java', `// Main Activity for the Robot Controller App\npackage org.firstinspires.ftc.robotcontroller.internal;\n// ... imports\npublic class FtcRobotControllerActivity extends Activity {\n    // ...\n}`],
  ['FtcRobotController/src/main/res/layout/activity_ftc_controller.xml', `<!-- Layout for the main controller activity -->\n<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent" />`],
  ['FtcRobotController/src/main/res/menu/ftc_robot_controller.xml', `<!-- Menu for the FTC Robot Controller -->\n<menu xmlns:android="http://schemas.android.com/apk/res/android">\n</menu>`],
  ['FtcRobotController/src/main/res/values/strings.xml', `<!-- String resources -->\n<resources>\n    <string name="app_name">FTC Robot Controller</string>\n</resources>`],
  ['FtcRobotController/src/main/res/xml/device_filter.xml', `<!-- USB Device Filter -->\n<resources>\n    <usb-device vendor-id="1234" product-id="5678" />\n</resources>`],
  ['LICENSE', 'MIT License\n\nCopyright (c) 2024\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...'],
  ['TeamCode/build.gradle', `// Build script for the TeamCode module.\n\napply from: '../../build.common.gradle'\n`],
  ['TeamCode/src/main/AndroidManifest.xml', `<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    package="com.qualcomm.ftcrobotcontroller" />\n`],
  ['TeamCode/src/main/java/org/firstinspires/ftc/teamcode/Autonomous.java', '// Autonomous code will go here.\n'],
  ['build.common.gradle', `// Common Gradle configuration for all modules.\n\nandroid {\n    compileSdkVersion 33\n}`],
  ['build.dependencies.gradle', `// Defines dependency versions for the entire project.\next {\n    // ...\n}`],
  ['build.gradle', `// Top-level build file for the entire project.\n\nbuildscript {\n    // ...\n}`],
  ['gradle/wrapper/gradle-wrapper.properties', `# Gradle Wrapper Properties\ndistributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.0-bin.zip`],
  ['gradle.properties', `# Project-wide Gradle settings.\n\norg.gradle.jvmargs=-Xmx2048m\n`],
  ['gradlew', '#!/usr/bin/env sh\n\n# Gradle start up script for UN*X\n\n# ... script content ...'],
  ['gradlew.bat', '@rem\r\n@rem Gradle start up script for Windows\r\n@rem\r\n\r\n@if "%DEBUG%" == "" @echo off\r\n@rem ... script content ...'],
  ['local.properties', `# This file is automatically generated by Android Studio.\n# Do not modify this file -- YOUR CHANGES WILL BE ERASED!\n#\n# This file must *NOT* be checked into Version Control Systems,\n# as it contains information specific to your local configuration.\n`],
  ['settings.gradle', `// Defines the modules included in the project.\n\ninclude ':TeamCode', ':FtcRobotController'`],
]);
