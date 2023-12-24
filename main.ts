//% color="#e76f51" weight=15 icon="\uf1b9"
//% groups='["Leds", "Motors", "Sensor","IR"]'
//% block="TabbyRobot"

namespace tabbyRobot {
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05
    const REG_BATTERY = 0x06

    let inited = false

    let neoStrip: neopixel.Strip;
    let distanceBuf = 0;
	let irVal = 0


    export enum LeftRight {
        //% block='Left'
        LEFT = 0,
        //% block='Right'
        RGIHT = 1,
    }

    export enum ServoList {
        //% block='S1'
        S1 = 0,
        //% block='S2'
        S2 = 1,
    }
	
	export enum IrButtons {
    //% block="menu"
    Menu = 2,
    //% block="up"
    Up = 5,
    //% block="left"
    Left = 8,
    //% block="right"
    Right = 10,
    //% block="down"
    Down = 13,
    //% block="ok"
    OK = 9,
    //% block="plus"
    Plus = 4,
    //% block="minus"
    Minus = 12,
    //% block="back"
    Back = 6,
    //% block="0"
    Zero = 14,
    //% block="1"
    One = 16,
    //% block="2"
    Two = 17,
    //% block="3"
    Three = 18,
    //% block="4"
    Four = 20,
    //% block="5"
    Five = 21,
    //% block="6"
    Six = 22,
    //% block="7"
    Seven = 24,
    //% block="8"
    Eight = 25,
    //% block="9"
    Nine = 26
	}

    
    export function init() {
        if (inited) return 
        pins.i2cWriteNumber(TABBY_ADDR, 0x01, NumberFormat.UInt8BE)
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
        inited = true
    }


    /**
     * Init RGB pixels on tabby robot
     */
    //% blockId="tabby_rgb" block="ambient RGB"
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
     * @param left set brightness; eg: 100
     * @param right set brightness; eg: 100
     */
    //% blockId="tabby_headlights" block="headlights left brightness $left right brightness $right"
    //% group="Leds"
    //% left.min=0 left.max=100
    //% right.min=0 right.max=100
    //% weight=250
    export function headLights(left: number, right: number) {
        init();
        let buf = pins.createBuffer(3)
        buf[0] = REG_HEADLIGHT
        buf[1] = right
        buf[2] = left
        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
    * Headlights all
    */
    //% blockId="tabby_headlights_all" block="headlights all $enabled"
    //% enabled.shadow=toggleOnOff
    //% group="Leds"
    //% weight=249
    export function headLightsAll(enabled: boolean) {
        init();
        let buf = pins.createBuffer(3)
        buf[0] = REG_HEADLIGHT
        if (enabled) {
            buf[1] = 100
            buf[2] = 100
        }
        else{
            buf[1] = 0
            buf[2] = 0
        }
        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
    * Headlights onoff control
    * @param enabled set; eg: true
    * @param enabled2 set; eg: true
    */
    //% blockId="tabby_headlights_onoff_control" block="headlights left $enabled right $enabled2"
    //% group="Leds"
    //% enabled.shadow=toggleOnOff
    //% enabled2.shadow=toggleOnOff
    //% weight=255
    export function headlightsOnOffControl(enabled: boolean, enabled2: boolean) {
        init();
        let buf = pins.createBuffer(3)
        buf[0] = REG_HEADLIGHT
        if (enabled2){
            buf[1] = 100
        }
        else
            buf[1] = 0

        if (enabled) {
            buf[2] = 100
        }
        else
            buf[2] = 0

        pins.i2cWriteBuffer(TABBY_ADDR, buf)

    }

    /**
     * Motor Speed
     */
    //% blockId="tabby_motor_speed" block="motor $idx left speed $left right speed $right"
    //% group="Motors"
    //% left.shadow="speedPicker"
    //% right.shadow="speedPicker"
    //% weight=340
    export function motorRun(left: number, right: number) {
        init();
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
    //% blockId="tabby_motor_stop" block="motor stop all"
    //% group="Motors"
    //% weight=330
    export function motorStop() {
        init();
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
     * @param degree set; eg: 90
     */
    //% blockId="tabby_servo_degree" block="servo $idx degree $degree"
    //% group="Motors"
    //% degree.min=0 degree.max=180
    //% weight=300
    export function servoSet(idx: ServoList, degree: number) {
        init();
        let buf4 = pins.createBuffer(3)
        buf4[0] = idx == ServoList.S1 ? REG_SERVO1 : REG_SERVO2
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
    //% blockId="tabby_tracking_sensor" block="tracking sensor $idx"
    //% group="Sensor"
    //% weight=300
    //% idx.fieldEditor="gridpicker"
    //% idx.fieldOptions.columns=2
    export function line(idx: LeftRight): number {
        let value = pins.analogReadPin(idx == LeftRight.LEFT ? AnalogPin.P2 : AnalogPin.P1)
        return value
    }

    /**
     * Battery voltage
     */
    //% blockId="tabby_battery_voltage" block="battery voltage(V)"
    //% group="Sensor"
    //% weight=200
    export function battery(): number {
        init();
        let buf5 = pins.createBuffer(1)
        buf5[0] = REG_BATTERY
        pins.i2cWriteBuffer(TABBY_ADDR, buf5)
        let value2 = pins.i2cReadNumber(TABBY_ADDR, NumberFormat.UInt16BE)
        // VBAT - 47K - ADC - 27K - GND
        // console.log("adc:"+value)
        value2 = Math.floor(value2 / 65535 * 2.74 * 3.3 * 100) / 100
        return value2
    }

    /**
     * signal pin
     * @param pin singal pin; eg: DigitalPin.P1
     */
    //% blockId=tabby_ultrasonic_distance block="ultrasonic distance(CM)"
    //% group="Sensor"
    //% weight=250
    export function ultrasonic(): number {
        let pin = DigitalPin.P8
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
	
	
	//% shim=IRRobot::irCode
	function irCode(): number {
        return 0;
    }

    //% group="IR"
    //% weight=100
    //% block="on IR receiving"
    export function irCallback(handler: () => void) {
        pins.setPull(DigitalPin.P15, PinPullMode.PullUp)
        control.onEvent(98, 3500, handler)
        control.inBackground(() => {
            while (true) {
                irVal = irCode()
                if (irVal != 0xff00) {
                    control.raiseEvent(98, 3500, EventCreationMode.CreateAndFire)
                }
                basic.pause(20)
            }
        })
    }

    /**
     * get IR value
     */
    //% group="IR"
    //% block="IR button $Button is pressed"
    //% weight=90
    //% Button.fieldEditor="gridpicker"
    //% Button.fieldOptions.columns=3
    export function irButton(Button: IrButtons): boolean {
        return (irVal & 0x00ff) == Button
    }





}
