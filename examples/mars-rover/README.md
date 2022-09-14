# Mars Rover kata

This example is included because it demonstrates the use of Scenario outlines
and testing asynchronous code, using the `Soon` keyword, which has built-in
retry logic.

The Rover in this implementation receives commands but does not reach the target
position immediately. It takes 100 ms per square to move, therefore assertions
have to deal with a system under test that is eventually consistent.
