namespace tabbyrobot {
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05

    let neoStrip: neopixel.Strip;

    export enum PWM {
        M1P = 0,
        M1N = 1,
        M2P = 2,
        M2N = 3,
        LEFT = 4,
        RIGHT = 5,
        S1 = 6,
        S2 = 7
    }

    export enum LeftRight {
        //% block='Left'
        LEFT = 0,
        //% block='Right'
        RGIHT = 1,
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
        buf[1] = left
        buf[2] = right
        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
     * Motor Speed
     */
    //% block="Motor $idx Left $left Right $right"
    //% left.shadow="speedPicker"
    //% right.shadow="speedPicker"
    export function motorRun(left: number, right: number) {
        let buf = pins.createBuffer(5)
        // REG, M1A, M1B, M2A, M2B
        buf[0] = REG_MOTOR
        if (left >= 0) {
            buf[1] = left
            buf[2] = 0

        } else {
            buf[1] = 0
            buf[2] = -left
        }
        if (right >= 0) {
            buf[3] = right
            buf[4] = 0
        } else {
            buf[3] = 0
            buf[4] = -right
        }

        pins.i2cWriteBuffer(TABBY_ADDR, buf)
    }

    /**
     * Motor Stop
     */
    //% block="Motor Stop"
    export function motorStop() {
        let buf = pins.createBuffer(5)
        // REG, M1A, M1B, M2A, M2B
        buf[0] = REG_MOTOR
        buf[1] = 0
        buf[2] = 0
        buf[3] = 0
        buf[4] = 0

        pins.i2cWriteBuffer(TABBY_ADDR, buf)
    }

    /**
     * Servo Degree
     */
    //% block="Servo $idx set to $degree"
    //% degree.min=0 degree.max=180
    export function servoSet(idx: LeftRight, degree: number) {
        let buf = pins.createBuffer(3)
        buf[0] = idx == LeftRight.LEFT ? REG_SERVO1 : REG_SERVO2
        let minPulse = 600
        let maxPulse = 2400
        let v_us = (degree * (maxPulse - minPulse) / 180 + minPulse)
        buf[1] = v_us & 0xff
        buf[2] = v_us >> 8
        pins.i2cWriteBuffer(TABBY_ADDR, buf)
    }

    /**
     * Line state
     */
    //% block="Line $idx"
    export function line(idx: LeftRight): number {
        let value = pins.analogReadPin(idx == LeftRight.LEFT ? AnalogPin.P1 : AnalogPin.P2)
        return value
    }



}
