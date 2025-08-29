# Design document

Goal: Build a simple timer which can be used as a productivity tool to aid in task management

## UI components

### Timer page

- A string display which shows remaining time on a timer in the format hh:mm:ss where hh = hours mm = minute and ss = second. It will default to whatever the timer is set to.
- The browser tab should also show the remaining time on it which will correspond to the hh:mm:ss format.
- There should be three buttons.
  - The first button will be a start / pause button which will change the text based upon the state.
  - The second button is a reset button.
- There should be a UI element to allow for muting the sound
- There should be some type of UI element which allows the user to set a goal for their current session.
  - When in edit mode, it will be a text box where information can be entered. It will be a helpful reminder for them to keep focus. There will be a save and cancel button. If cancel button is pushed, revert to previous value. If save is pushed, display that text below the timer.
- When the timer is up, convert the timer text to say "Time is Up!" alternating with 00:00:00 flashing on the screen to let the user know. This is especially important if it is muted. The browser tab should flash with "Time is Up!" as well.
  Settings Page
- User should be able to set the number of hours, minutes, and seconds they want the timer to run for. Don't allow the user to put in negative or non-number values. Number values can only be 0-59.

## Functionality

- When start button is pressed, start the timer if it is not running. If the timer is running, the first button will pause the timer instead.
- The timer itself should count down one second at a time, and be as accurate as possible. It should use a background service worker to prevent being throttled by the client's web browser.
- If the reset button is pressed, the timer will go back to mm:ss that the user has set up in settings and stop the timer.
- User's settings should be stored in local storage, so that the next time they use the site it remembers. Settings should be stored in a way that more items can be added in the future without causing any breakage.
- When the timer has elapsed, play the sound. The sound byte should be a neutral alarm noise that is noticeable but not too jarring.
- Default the timer to 00:25:00 initially. (zero hours, 25 minutes, 0 seconds)
