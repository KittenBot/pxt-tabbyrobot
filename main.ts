namespace tabbyrobot {
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05
    const REG_BATTERY = 0x06

    let neoStrip: neopixel.Strip;


    export enum LeftRight {
        //% block='Left'
        LEFT = 0,
        //% block='Right'
        RGIHT = 1,
    }

    /**
     * Init Peripherals on tabby robot
     */
    //% blockId="tabby_init" block="Tabby Init"
    //% group="Tabby"  weight=80
    export function init() {
        pins.i2cWriteNumber(TABBY_ADDR, 0x01, NumberFormat.UInt8BE)
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
    }


    /**
     * Init RGB pixels on tabby robot
     */
    //% blockId="tabby_rgb" block="RGB"
    //% group="Tabby"  weight=63
    export function rgb(): neopixel.Strip {
        if (!neoStrip) {
            neoStrip = neopixel.create(DigitalPin.P16, 2, NeoPixelMode.RGB)
        }

        return neoStrip;
    }

    /**
     * Front Light control
     */
    //% block="Front Light Left $left Right $right"
    //% group="Tabby"
    //% left.min=0 left.max=100
    //% right.min=0 right.max=100
    export function frontlight(left: number, right: number) {
        let buf = pins.createBuffer(3)
        buf[0] = REG_HEADLIGHT
        buf[1] = right
        buf[2] = left
        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
     * Motor Speed
     */
    //% block="Motor $idx Left $left Right $right"
    //% left.shadow="speedPicker"
    //% right.shadow="speedPicker"
    export function motorRun(left: number, right: number) {
        let buf2 = pins.createBuffer(5)



        // REG, M1A, M1B, M2A, M2B
        buf2[0] = REG_MOTOR
        if (left >= 0) {
            buf2[1] = left
            buf2[2] = 0

        } else {
            buf2[1] = 0
            buf2[2] = -left
        }
        if (right >= 0) {
            buf2[3] = right
            buf2[4] = 0
        } else {
            buf2[3] = 0
            buf2[4] = -right
        }

        pins.i2cWriteBuffer(TABBY_ADDR, buf2)
    }

    /**
     * Motor Stop
     */
    //% block="Motor Stop"
    export function motorStop() {
        let buf3 = pins.createBuffer(5)
        // REG, M1A, M1B, M2A, M2B
        buf3[0] = REG_MOTOR
        buf3[1] = 0
        buf3[2] = 0
        buf3[3] = 0
        buf3[4] = 0

        pins.i2cWriteBuffer(TABBY_ADDR, buf3)
    }

    /**
     * Servo Degree
     */
    //% block="Servo $idx set to $degree"
    //% degree.min=0 degree.max=180
    export function servoSet(idx: LeftRight, degree: number) {
        let buf4 = pins.createBuffer(3)
        buf4[0] = idx == LeftRight.LEFT ? REG_SERVO1 : REG_SERVO2
        let minPulse = 600
        let maxPulse = 2400
        let v_us = (degree * (maxPulse - minPulse) / 180 + minPulse)
        buf4[1] = v_us & 0xff
        buf4[2] = v_us >> 8
        pins.i2cWriteBuffer(TABBY_ADDR, buf4)
    }

    /**
     * Line state
     */
    //% block="Line $idx"
    export function line(idx: LeftRight): number {
        let value = pins.analogReadPin(idx == LeftRight.LEFT ? AnalogPin.P2 : AnalogPin.P1)
        return value
    }

    /**
     * Battery voltage
     */
    //% block="Battery voltage"
    export function battery(): number {
        let buf5 = pins.createBuffer(1)
        buf5[0] = REG_BATTERY
        pins.i2cWriteBuffer(TABBY_ADDR, buf5)
        let value2 = pins.i2cReadNumber(TABBY_ADDR, NumberFormat.UInt16BE)
        // VBAT - 27K - ADC - 47K - GND
        // console.log("adc:"+value)
        value2 = value2 / 65535 * 1.57 * 3.3
        return value2
    }

    /**
     * Ultrasonic distance
     */
    //% block="Ultrasonic distance"
    export function ultrasonic(): number {
        // send pulse
        let trig = DigitalPin.P14
        let echo = DigitalPin.P14
        pins.setPull(trig, PinPullMode.PullNone)
        pins.digitalWritePin(trig, 0)
        control.waitMicros(2)
        pins.digitalWritePin(trig, 1)
        control.waitMicros(10)
        pins.digitalWritePin(trig, 0)

        // read pulse
        let d = pins.pulseIn(echo, PulseValue.High, 50000)
        return d / 58
    }





}
