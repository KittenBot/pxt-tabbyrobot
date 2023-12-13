namespace tabbyrobot {
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05
    const REG_BATTERY = 0x06

    let neoStrip: neopixel.Strip;
    let distanceBuf = 0;


    export enum LeftRight {
        //% block='Left'
        LEFT = 0,
        //% block='Right'
        RGIHT = 1,
    }

    export enum Servolist {
        //% block='S1'
        S1 = 0,
        //% block='S2'
        S2 = 1,
    }

    /**
     * Init Peripherals on tabby robot
     */
    //% blockId="tabby_init" block="Tabby Init"
    //% group="Tabby"  weight=300
    export function init() {
        pins.i2cWriteNumber(TABBY_ADDR, 0x01, NumberFormat.UInt8BE)
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
    }


    /**
     * Init RGB pixels on tabby robot
     */
    //% blockId="tabby_rgb" block="Ambient RGB"
    //% group="Leds"  weight=63
    //% weight=200
    export function rgb(): neopixel.Strip {
        if (!neoStrip) {
            neoStrip = neopixel.create(DigitalPin.P16, 2, NeoPixelMode.RGB)
        }

        return neoStrip;
    }

    /**
     * Headlights control
     */
    //% block="Headlights Left $left Right $right"
    //% group="Leds"
    //% left.min=0 left.max=100
    //% right.min=0 right.max=100
    //% weight=250
    export function Headlights(left: number, right: number) {
        let buf = pins.createBuffer(3)
        buf[0] = REG_HEADLIGHT
        buf[1] = right
        buf[2] = left
        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
     * Motor Speed
     */
    //% block="Motor $idx Left speed $left Right speed $right"
    //% group="Motors"
    //% left.shadow="speedPicker"
    //% right.shadow="speedPicker"
    //% weight=340
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
    //% block="Motor Stop All"
    //% group="Motors"
    //% weight=330
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
    //% block="Servo $idx degree $degree"
    //% group="Motors"
    //% degree.min=0 degree.max=180
    //% weight=300
    export function servoSet(idx: Servolist, degree: number) {
        let buf4 = pins.createBuffer(3)
        buf4[0] = idx == Servolist.S1 ? REG_SERVO1 : REG_SERVO2
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
    //% block="Tracking sensor $idx"
    //% group="Sensor"
    //% weight=300
    export function line(idx: LeftRight): number {
        let value = pins.analogReadPin(idx == LeftRight.LEFT ? AnalogPin.P2 : AnalogPin.P1)
        return value
    }

    /**
     * Battery voltage
     */
    //% block="Battery voltage"
    //% group="Sensor"
    //% weight=200
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
     * signal pin
     * @param pin singal pin; eg: DigitalPin.P1
     * @param unit desired conversion unit
     */
    //% blockId=robotbit_holeultrasonicver block="Ultrasonic distance"
    //% group="Sensor"
    //% weight=250
    export function ultrasonic(): number {
        let pin = DigitalPin.P14
        pins.setPull(pin, PinPullMode.PullNone);
        // pins.setPull(pin, PinPullMode.PullDown);
        pins.digitalWritePin(pin, 0);
        control.waitMicros(2);
        pins.digitalWritePin(pin, 1);
        control.waitMicros(10);
        pins.digitalWritePin(pin, 0);
        pins.setPull(pin, PinPullMode.PullUp);

        // read pulse
        let d = pins.pulseIn(pin, PulseValue.High, 30000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;
        pins.digitalWritePin(pin, 0);
        basic.pause(15)
        if (parseInt(control.hardwareVersion()) == 2) {
            d = ret * 10 / 58;
        }
        else {
            // return Math.floor(ret / 40 + (ret / 800));
            d = ret * 15 / 58;
        }
        
        return Math.floor(d / 10) 

    }





}
