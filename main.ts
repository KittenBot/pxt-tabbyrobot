namespace tabbyrobot {

    let isInited = false;
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
        LEFT=0,
        //% block='Right'
        RGIHT=1,
    }


    function PCA9634Init(){
        let addr = 0x00
        let buf = pins.createBuffer(2)
        buf[0] = 0x0
        buf[1] = 0x01
        pins.i2cWriteBuffer(addr, buf)
        basic.pause(200)

        pins.i2cWriteNumber(addr, 0x0, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);

        buf = pins.createBuffer(3)
        buf[0] = 0x0C | 0x80
        buf[1] = 0xAA
        buf[2] = 0xAA
        pins.i2cWriteBuffer(addr, buf)
        basic.pause(200)
        isInited = true;
    }

    function PCA9634Pwm(ch: PWM, value: number){
        if (!isInited) PCA9634Init()
        let buf2 = pins.createBuffer(2)
        buf2[0] = (ch+1)*2;
        buf2[1] = value
        pins.i2cWriteBuffer(0, buf2)
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
    //% block="Front Light $idx $value"
    //% group="Tabby"
    export function frontlight(idx: LeftRight, value: number){

    }

    /**
     * Motor Speed
     */
    //% block="Motor $idx run at $speed"
    //% speed.shadow="speedPicker"
    export function motorRun(idx: LeftRight, speed: number){

    }

    /**
     * Servo Degree
     */
    //% block="Servo $idx set to $degree"
    //% degree.min=0 degree.max=180
    export function servoSet(idx: LeftRight, degree: number){

    }



}
