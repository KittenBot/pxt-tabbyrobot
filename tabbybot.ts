//% color="#e76f51" weight=15 icon="\uf1b9"
//% groups='["Leds", "RGB", "Motors", "Sensor","IR"]'
//% block="TabbyBot"

namespace tabbyRobot {
    const TABBY_ADDR = 0x16
    const REG_MOTOR = 0x02
    const REG_SERVO1 = 0x03
    const REG_SERVO2 = 0x04
    const REG_HEADLIGHT = 0x05
    const REG_BATTERY = 0x06
    const REG_VERSION = 0X99
    let irState: IrState;
    let kittenIREventId = 202412

    interface IrState {
        protocol: 1;
        hasNewDatagram: boolean;
        bitsReceived: uint8;
        addressSectionBits: uint16;
        commandSectionBits: uint16;
        hiword: uint16;
        loword: uint16;
        activeCommand: number;
        repeatTimeout: number;
        onIrDatagram: () => void;
    }

    const IR_REPEAT = 256;
    const IR_INCOMPLETE = 257;
    const IR_DATAGRAM = 258;

    const REPEAT_TIMEOUT_MS = 120;

    export enum IrCmd {
        //% block="power"
        OFF = 41565,
        //% block="menu"
        Menu = 25245,
        //% block="mute"
        Mute = 57885,
        //% block="mode"
        Mode = 8925,
        //% block="+"
        Add = 765,
        //% block="🔙"
        Back = 49725,
        //% block="⏪️"
        Fb = 57375,
        //% block="⏯︎"
        Stop = 43095,
        //% block="⏩︎"
        Ff = 36975,
        //% block="0"
        Zero = 26775,
        //% block="-"
        Minus = 39015,
        //% block="ok"
        OK = 45135,
        //% block="1"
        One = 12495,
        //% block="2"
        Tow = 6375,
        //% block="3"
        Three = 31365,
        //% block="4"
        Four = 4335,
        //% block="5"
        Five = 14535,
        //% block="6"
        Six = 23205,
        //% block="7"
        Seven = 17085,
        //% block="8"
        Eight = 19125,
        //% block="9"
        Nine = 21165,
    }

    let inited = false

    //let neoStrip: neopixel.Strip;
    let distanceBuf = 0;
	let irVal = 0
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 2 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let _brightness = 100


    export enum LeftRight {
        //% block='left'
        Left = 0,
        //% block='right'
        Right = 1,
    }

    export enum ServoList {
        //% block='S1'
        S1 = 0,
        //% block='S2'
        S2 = 1,
    }
	
	export enum IrButtons {
    //% block="menu"
    Menu = 98,
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
    Six = 90,
    //% block="7"
    Seven = 66,
    //% block="8"
    Eight = 74,
    //% block="9"
    Nine = 82
	}

    /**
     * colors for ws2812 strip
     */
    export enum RGBColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    
    export function init() {
        if (inited) return 
        pins.i2cWriteNumber(TABBY_ADDR, 0x01, NumberFormat.UInt8BE)
        pins.setPull(DigitalPin.P1, PinPullMode.PullNone)
        pins.setPull(DigitalPin.P2, PinPullMode.PullNone)
        inited = true
    }

    /**
     * Controls the brightness of the left and right headlights.Brightness level(0-100)
     * @param left set brightness; eg: 100
     * @param right set brightness; eg: 100
     */
    //% blockId=tabby_headlights block="headlights left brightness $left right brightness $right"
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
    * Controls the state of all headlights.If true, turns on the headlights; if false, turns them off.
    */
    //% blockId=tabby_headlights_all block="headlights all $enabled"
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
    * Controls the on/off state of the left and right headlights.
    * @param enabled set; eg: true
    * @param enabled2 set; eg: true
    */
    //% blockId=tabby_headlights_onoff_control block="headlights left $enabled right $enabled2"
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
     * Controls the speed and direction of the left and right motors.Speed range is from -100 to 100, where positive values indicate forward motion and negative values indicate backward motion.
     * @param left speed; eg: 30
     * @param right speed; eg: 30
     */
    //% blockId=tabby_motor_speed
    //% block="motor left speed $left \\% right speed $right \\%"
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
            buf2[1] = 0
            buf2[2] = left

        } else {
            buf2[1] = -left
            buf2[2] = 0
        }
        if (right >= 0) {
            buf2[3] = 0
            buf2[4] = right
        } else {
            buf2[3] = -right
            buf2[4] = 0
        }

        pins.i2cWriteBuffer(TABBY_ADDR, buf2)
    }

    /**
     * Stops all motors.
     */
    //% blockId=tabby_motor_stop block="motor stop all"
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
     * Sets the angle of the specified servo motor.Angle range is from 0 to 180 angles.
     * @param angle set; eg: 90
     */
    //% blockId=tabby_servo_angle block="set servo $idx angle to $angle=protractorPicker °"
    //% idx.fieldEditor="gridpicker"
    //% idx.fieldOptions.width=100
    //% idx.fieldOptions.columns=2
    //% group="Motors"
    //% angle.min=0 angle.max=180
    //% weight=300
    export function servoSet(idx: ServoList, angle: number) {
        init();
        let buf4 = pins.createBuffer(3)
        buf4[0] = idx == ServoList.S1 ? REG_SERVO1 : REG_SERVO2
        let minPulse = 600
        let maxPulse = 2400
        let v_us = (angle * (maxPulse - minPulse) / 180 + minPulse)
        buf4[1] = v_us & 0xff
        buf4[2] = v_us >> 8
        pins.i2cWriteBuffer(TABBY_ADDR, buf4)
    }

    /**
     * Retrieves the analog value from the specified tracking sensor.
     */
    //% blockId=tabby_tracking_sensor block="tracking sensor $idx"
    //% group="Sensor"
    //% weight=300
    //% idx.fieldEditor="gridpicker"
    //% idx.fieldOptions.columns=2
    export function line(idx: LeftRight): number {
        let value = pins.analogReadPin(idx == LeftRight.Left ? AnalogPin.P2 : AnalogPin.P1)
        return value
    }

    /**
     * Retrieves the battery voltage in volts (V).Battery voltage range is from 3.7V to 4.2V.When the voltage is close to 3.7V, please recharge the battery promptly.
     */
    //% blockId=tabby_battery_voltage block="battery voltage(V)"
    //% group="Sensor"
    //% weight=200
    export function battery(): number {
        init();
        let buf5 = pins.createBuffer(1)
        buf5[0] = REG_BATTERY
        pins.i2cWriteBuffer(TABBY_ADDR, buf5)
        let value2 = pins.i2cReadNumber(TABBY_ADDR, NumberFormat.UInt16BE)
        // VBAT - 47K - ADC - 27K - GND
        //console.log("adc:" + value2)
        value2 = Math.floor(value2 / 65535 * 2.74 * 3.3 * 100) / 100
        return value2
    }

    /**
     * Retrieves the distance detected by ultrasonic waves in centimeters (cm).
     * @param pin singal pin; eg: DigitalPin.P1
     */
    //% blockId=tabby_ultrasonic_distance block="ultrasonic distance(cm)"
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
        let distance = Math.floor(d / 10)
        if(distance){
            return distance
        }else{
            return 999
        }
         

    }

    /**
     * Sets the color of all RGB LEDs.
     */
    //% group="RGB"
    //% blockId=tabby_rgb_show_color
    //% block=" set RGB color |%rgb"
    //% weight=200
    export function rgbShowColor(rgb: RGBColors) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 2 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P16)
    }

    /**
     * Sets the brightness of the RGB LEDs.
     * @param brightness to set , eg: 50
     */
    //% group="RGB"
    //% brightness.min=0 brightness.max=255
    //% blockId=tabby_set_rgb_brightness
    //% block="set RGB brightness |%brightness"
    //% weight=250
    export function setRgbBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     *  Clears all RGB LEDs.
     */
    //% group="RGB"
    //% blockId=tabby_clear_all_rgb
    //% block="clear all RGB"
    //% weight=260
    export function clearAllRgb() {
        rgbShowColor(0)
    }

    /**
     * Adjusts the color of a specific RGB light individually.
     * @param index  , eg: 1
     */
    //% group="RGB"
    //% index.min=1 index.max=2
    //% blockId=tabby_set_index_color
    //% block="set RGB No.|%index color|%rgb"
    //% weight=190
    export function setIndexColor(index: number, rgb: RGBColors) {
        let f = index-1;
        let t = index-1;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, DigitalPin.P16)

    }

    /**
    * Reads the firmware version of the device.
    */
    //% block="read version"
    //% blockId=tabby_read_version
    //% weight=2
    //% advanced=true
    export function readVersion():string {
        init();
        pins.i2cWriteNumber(TABBY_ADDR, REG_VERSION, NumberFormat.UInt8BE);
        let versionBuffer = pins.i2cReadBuffer(TABBY_ADDR, 3);
        let versionString = `v${versionBuffer[0]}.${versionBuffer[1]}.${versionBuffer[2]}`;
        return versionString;
    }
    function initIr() {
        initIrState();

        enableIrMarkSpaceDetection(DigitalPin.P15);

        background.schedule(notifyIrEvents, background.Thread.Priority, background.Mode.Repeat, REPEAT_TIMEOUT_MS);
    }

    control.inBackground(initIr);

    function appendBitToDatagram(bit: number): number {
        irState.bitsReceived += 1;

        if (irState.bitsReceived <= 8) {
            irState.hiword = (irState.hiword << 1) + bit;
        } else if (irState.bitsReceived <= 16) {
            irState.hiword = (irState.hiword << 1) + bit;
        } else if (irState.bitsReceived <= 32) {
            irState.loword = (irState.loword << 1) + bit;
        }

        if (irState.bitsReceived === 32) {
            irState.addressSectionBits = irState.hiword & 0xffff;
            irState.commandSectionBits = irState.loword & 0xffff;
            serial.writeString(irState.addressSectionBits.toString() + "-" + irState.commandSectionBits.toString())
            control.raiseEvent(kittenIREventId, irState.commandSectionBits)
            return IR_DATAGRAM;
        } else {
            return IR_INCOMPLETE;
        }
    }

    function decode(markAndSpace: number): number {
        if (markAndSpace < 1600) {
            // low bit
            return appendBitToDatagram(0);
        } else if (markAndSpace < 2700) {
            // high bit
            return appendBitToDatagram(1);
        }

        irState.bitsReceived = 0;

        if (markAndSpace < 12500) {
            // Repeat detected
            return IR_REPEAT;
        } else if (markAndSpace < 14500) {
            // Start detected
            return IR_INCOMPLETE;
        } else {
            return IR_INCOMPLETE;
        }
    }

    function enableIrMarkSpaceDetection(pin: DigitalPin) {
        pins.setPull(pin, PinPullMode.PullNone);

        let mark = 0;
        let space = 0;

        pins.onPulsed(pin, PulseValue.Low, () => {
            mark = pins.pulseDuration();
        });

        pins.onPulsed(pin, PulseValue.High, () => {
            // LOW
            space = pins.pulseDuration();
            const status = decode(mark + space);

            if (status !== IR_INCOMPLETE) {
                handleIrEvent(status);
            }
        });
    }

    function handleIrEvent(irEvent: number) {

        // Refresh repeat timer
        if (irEvent === IR_DATAGRAM || irEvent === IR_REPEAT) {
            irState.repeatTimeout = input.runningTime() + REPEAT_TIMEOUT_MS;
        }

        if (irEvent === IR_DATAGRAM) {
            irState.hasNewDatagram = true;

            if (irState.onIrDatagram) {
                background.schedule(irState.onIrDatagram, background.Thread.UserCallback, background.Mode.Once, 0);
            }

            const newCommand = irState.commandSectionBits >> 8;
            // Process a new command
            if (newCommand !== irState.activeCommand) {

                irState.activeCommand = newCommand;
            }
        }
    }

    function initIrState() {
        if (irState) {
            return;
        }

        irState = {
            protocol: undefined,
            bitsReceived: 0,
            hasNewDatagram: false,
            addressSectionBits: 0,
            commandSectionBits: 0,
            hiword: 0, // TODO replace with uint32
            loword: 0,
            activeCommand: -1,
            repeatTimeout: 0,
            onIrDatagram: undefined,
        };
    }

    function notifyIrEvents() {
        if (irState.activeCommand === -1) {
            // skip to save CPU cylces
        } else {
            const now = input.runningTime();
            if (now > irState.repeatTimeout) {
                // repeat timed out
                irState.bitsReceived = 0;
                irState.activeCommand = -1;
            }
        }
    }

    /**
     * Registers code to run when a specific button on the remote control is pressed.
     * @param handler 
     */
    //% blockId=tabby_on_Remote_control_pressed block="on remote rontrol |%btn pressed"
    //% weight=98 group="IR"
    //% btn.fieldEditor="gridpicker"
    //% btn.fieldOptions.columns=3
    export function onRemoteControlPressed(btn: IrCmd, handler: () => void) {
        control.onEvent(kittenIREventId, btn, handler);
    }

    function ir_rec_to16BitHex(value: number): string {
        let hex = "";
        for (let pos = 0; pos < 4; pos++) {
            let remainder = value % 16;
            if (remainder < 10) {
                hex = remainder.toString() + hex;
            } else {
                hex = String.fromCharCode(55 + remainder) + hex;
            }
            value = Math.idiv(value, 16);
        }
        return hex;
    }
}