// Test Infrared Remote Control
// Simulate pressing the Mute button, expect to display the No icon
tabbyRobot.onRemoteControlPressed(tabbyRobot.IrCmd.Mute, function () {
    basic.showIcon(IconNames.No)
})

// Simulate pressing the OFF button, expect to display the Yes icon
tabbyRobot.onRemoteControlPressed(tabbyRobot.IrCmd.OFF, function () {
    basic.showIcon(IconNames.Yes)
})
serial.redirectToUSB()

// Test Headlights Control
tabbyRobot.headlightsOnOffControl(true, true)
basic.pause(1000)
tabbyRobot.headlightsOnOffControl(false, false)
basic.pause(1000)
tabbyRobot.headLights(100, 100)
basic.pause(1000)
tabbyRobot.headLights(0, 0)
basic.pause(1000)
tabbyRobot.headLightsAll(false)
basic.pause(1000)
tabbyRobot.headLightsAll(true)
basic.pause(1000)

// Test RGB Lights Control
tabbyRobot.rgbShowColor(tabbyRobot.RGBColors.Red)
basic.pause(1000)
tabbyRobot.clearAllRgb()
basic.pause(1000)
tabbyRobot.setIndexColor(1, tabbyRobot.RGBColors.White)
tabbyRobot.setIndexColor(2, tabbyRobot.RGBColors.White)
basic.pause(1000)
tabbyRobot.setRgbBrightness(0)
basic.pause(1000)

// Test Motor Control
tabbyRobot.motorRun(30, 30)
basic.pause(1000)
tabbyRobot.motorStop()
basic.pause(1000)

// Test Servo Control
tabbyRobot.servoSet(tabbyRobot.ServoList.S1, 90)
basic.pause(1000)
tabbyRobot.servoSet(tabbyRobot.ServoList.S1, 0)
basic.pause(1000)


// Expected test results:
// - Left line tracking sensor value
// - Right line tracking sensor value
// - Ultrasonic sensor distance value
// - Battery voltage value
// - Device version number
basic.forever(function () {
    serial.writeValue("left", tabbyRobot.line(tabbyRobot.LeftRight.Left))
    serial.writeValue("right", tabbyRobot.line(tabbyRobot.LeftRight.Right))
    serial.writeValue("distance", tabbyRobot.ultrasonic())
    serial.writeValue("battery", tabbyRobot.battery())
    serial.writeLine(tabbyRobot.readVersion())

    basic.pause(3000)
})
