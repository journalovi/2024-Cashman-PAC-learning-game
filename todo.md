# Todos

2023-07

- [x] Fix Sample Error
- [x] Add the confusion matrix + metrics to the scatterplot
- [x] Add illustration of TP, TN, FP, FN for when we test the candidate (add dashed textures and wavy textures for FP and FN, respectively)
- [x] Place the version at the beginning that just auto-plays, and has the big "start over" button
- [x] Rewrite the general text
- [X] Add a configuration layer that lets things be turned on and off for different parts of the page
- [x] Place a "when you have played the game a few times, scroll down to see how this game can explain many of the challenges in machine learning.  Or skip directly to the full simulator, where you can see illustrations of how different algorithms address these challenges."
- [X] Create a version of the scatterplot that takes in a static set of data
- [X] Use the static set of data in 3 ways for training/testing mismatch, model class-mismatch (xor), and probabalistic/regularization
- [X] Use the example of static data from earlier to draw out the patches on the PAC-learnability proof

- [] Move details to annotations to make it more readable
- [x] Proofread the text
- [x] Fix calculations of test error for when there are no points
- [] Fix scroll offset for the scroller buttons
- [x] Add a gamechanger button at the top
- [x] Consider adding a table of contents?
- [x] Consider adding an info button?
- [] speed seems to be too fast when we get to the bottom.

Deploy via https://gist.github.com/cobyism/4730490

## JOVI

- [x] At a high level, R1 and R2 request more details and instructions on how the game works in the introduction (#5, #6).
- []  At a low level, several technical issues were raised. R2 notes that the fade in animation for points can be confusing (#6). R3 perceived a difference between the points displayed thus far and the final set of points displayed after clicking the "TEST!" button (#7) I noticed that when no rectangle is drawn in the game, an error is thrown when I hit the "TEST!" button. R1 and R2 observed a similar issue (#5, #6).
- [] These suggestions are optional, but reviewers also mentioned potential enhancements. For example, R3 suggests visualizing true/false positives and negatives to enhance clarity (#7). R1 also suggests some enhancements to make the game more personalized and game-like (#5).
- [] R1 and R2 find the Introduction -"Why this is important" section to be a bit too abstract (#5, #6). Further, R2 finds the current positioning of the Gender Shade example to be confusing/misleading (#6).
- [] R2 would like to see a clearer explanation of the visualization in the game within the article text (#6). Similarly, R1 recommends labeling relevant variables within the visualization to clarify their purpose within the text (#5).
- [] R1 finds the "Assuming the Worst" title to be misleading, and recommends framing this section in terms of adversarial examples (#5).
- [] In terms of clarifying concepts, R3 asked whether toughest fit error may have a more general explanation in terms of sum of error rather than precise fractions of epsilon (#7).
- [] R1 points out that the text and the visuals may not always be aligned correctly (#5). Similarly, R2 finds that the game may update too early in response to article transitions (#6).
- [] R3 notes that some article styling breaks in the absence of an internet connection (#7). R3 also makes multiple (minor) suggestions for fixing typos and improving the overall styling of the article (#7).
- [] a11y https://github.com/journalovi/2024-Cashman-PAC-learning-game/issues/10
	- [] Try out on phones
	- [] make chart responsive?
	- [] better formatting of numbers
	- [] Change circles to circles and xs
	- [] change contrast of link text
	- [] add alt text for buttons and images