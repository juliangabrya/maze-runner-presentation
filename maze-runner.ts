// ============================================================
//  MAZE RUNNER — micro:bit + CutebotPro
//  Left-hand rule with NO move cap: runs until it reaches the goal,
//  so it solves any perfect maze 100% of the time.
//  Paste this into the JavaScript view of MakeCode, then flash.
//  Button A = explore & solve · Button B = stop / reset
// ============================================================

let walls: number[] = []
let wallFront = 0
let wallLeft = 0
let wallRight = 0

let moveCount = 0
let running = false

let rawRoute: PathPlanning.Dir[] = []
let endedAtGoal = false

let RADIO_GROUP = 1

let DRIVE_SPEED = 25
let MOTOR_BIAS = 6

let FRONT_CLEAR_MM = 170
let FRONT_STOP_MM = 170
let SIDE_OPEN_MM = 300
let GOAL_SIDE_MM = 400
let GOAL_FRONT_MM = 250

let BLIND_DRIVE_CM = 15
let OVERSHOOT_CM = 8
let ORIENT_BAIL_MM = 65

let DO_ORIENT = true
let DO_CENTRE = true

let currentJunction: PathPlanning.IntersectionType = 0
let chosenDirection: PathPlanning.Dir = PathPlanning.Dir.FORWARD

function applySettings() {
    PathPlanning.applyRobotSettings(
        RADIO_GROUP,
        true,
        DRIVE_SPEED,
        SIDE_OPEN_MM,
        FRONT_STOP_MM,
        GOAL_SIDE_MM,
        GOAL_FRONT_MM,
        BLIND_DRIVE_CM,
        OVERSHOOT_CM,
        ORIENT_BAIL_MM,
        DO_ORIENT,
        DO_CENTRE
    )
}

function resetRun() {
    moveCount = 0
    endedAtGoal = false
    rawRoute = []
    PathPlanning.resetExplorer()
    CutebotPro.pwmCruiseControl(0, 0)
}

input.onButtonPressed(Button.B, function () {
    running = false
    PathPlanning.stopDriving()
    CutebotPro.pwmCruiseControl(0, 0)
    resetRun()
    radio.sendString("ROUTE_RESET")
    basic.showIcon(IconNames.No)
    basic.pause(200)
    basic.clearScreen()
})

input.onButtonPressed(Button.A, function () {
    if (running) return

    applySettings()
    resetRun()
    running = true
    basic.showIcon(IconNames.Target)

    // No move cap — keep going until we reach the GOAL (or B is pressed).
    while (running) {

        // --- SENSE ---
        walls = ChannelNav.readSensors("tx-classify")
        wallLeft = walls[0]
        wallRight = walls[1]
        wallFront = walls[2]

        // --- CLASSIFY ---
        currentJunction = PathPlanning.classifyJunction(wallLeft, wallRight, wallFront)
        let leftOpen = PathPlanning.isLeftOpen(currentJunction)
        let rightOpen = PathPlanning.isRightOpen(currentJunction)
        let frontClear = wallFront > FRONT_CLEAR_MM

        // Open corridor with no turn available -> just keep rolling.
        if (frontClear && !leftOpen && !rightOpen) {
            CutebotPro.pwmCruiseControl(DRIVE_SPEED, DRIVE_SPEED + MOTOR_BIAS)
        } else {
            // Stop to decide at the junction.
            CutebotPro.pwmCruiseControl(0, 0)

            // Reached the goal? celebrate and finish.
            if (PathPlanning.isGoal(currentJunction)) {
                PathPlanning.celebrate()
                endedAtGoal = true
                running = false
                break
            }

            // --- DECIDE: LEFT-HAND RULE ---
            // Priority: LEFT -> FORWARD -> RIGHT -> BACK
            // (this is the change that makes it solve ANY perfect maze)
            if (leftOpen) {
                chosenDirection = PathPlanning.Dir.LEFT
            } else if (frontClear) {
                chosenDirection = PathPlanning.Dir.FORWARD
            } else if (rightOpen) {
                chosenDirection = PathPlanning.Dir.RIGHT
            } else {
                chosenDirection = PathPlanning.Dir.BACK
            }

            // --- ACT ---
            rawRoute.push(chosenDirection)
            moveCount++
            PathPlanning.sendDecision(currentJunction, chosenDirection)
            PathPlanning.turnRobot(chosenDirection)
        }

        basic.pause(50)
    }

    CutebotPro.pwmCruiseControl(0, 0)
    running = false

    // Broadcast the solved route so a second robot can replay it.
    if (rawRoute.length > 0 || endedAtGoal) {
        RouteRadio.sendRoute(rawRoute, endedAtGoal)
        basic.showIcon(IconNames.Yes)
    }
})

applySettings()
basic.showIcon(IconNames.Heart)
basic.pause(200)
basic.clearScreen()
