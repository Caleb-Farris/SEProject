//**********************************SITE.JS*************************************
//
// Entry point for SEProject.  This file controls the interactive display of the
// website.  There are only two HTML pages - the latter page is displayed by
// most of the JS functions in this file.
// 
//******************************************************************************

// Initial constant declarations.  The regex is used for input validation, 
// whereas the rest are enumerations of the stages of the program plus the 
// content html for each stage.  The regex is complicated but necessary.
const REGEX_INPUT = /^(\(?[+-]?\(?(\(?((\d+)?([xX])(\^\d+)?)(\)|\)\^\d+)?|\(?(\d+(\^\d+)?)(\)|\)\^\d+)?)(\)|\)\^\d+)?)+(\)|\)\^\d+)?$/,
    FORMS = 0,
    RZT = 1,
    DESCARTES = 2,
    SYNTHETIC = 3,
    FINAL = 4,
    STAGE_CONTENT = [
        ".recognizable-forms-content",
        ".rational-zero-content",
        ".descartes-content",
        ".synthetic-content",
        ".final-content"
    ];

//------------------------------------------------------------------------------
//                              CLASS:  STAGE
//
//  Used to keep up with current and previous stages.  It also marks which 
//  stages have been comleted as they are encountered.
//------------------------------------------------------------------------------
function Stage(initialStage) {
    // CONSTRUCTOR
    let currentStage = initialStage,
        previousStage = initialStage, // Does not affect program
        completed = initiateCompleted();

    // ACCESSOR
    this.getCurrentStage = function() {
        return currentStage;
    }

    this.getPreviousStage = function () {
        return previousStage;
    }

    this.isCompleted = function (stage) {
        return completed[stage];
    }

    // MUTATOR
    this.setStage = function (prevStage, curStage) {
        previousStage = prevStage;
        currentStage = curStage;
    }

    // Used to mark the stage as completed once it is reached 
    this.markStageCompleted = function (stage) {
        completed[stage] = true;
    }

    // INITIALIZER
    function initiateCompleted() {
        let c = []
        while (c.length <= FINAL) {
            c.push(false);
        }

        return c;
    }
}

//##############################################################################
//********************************INPUT STAGE***********************************
//##############################################################################

//------------------------------------------------------------------------------
//                           CLASS:  InputValidator
//
//  This class takes in user input and makes sure that it is in the proper 
//  format.  
//------------------------------------------------------------------------------
function InputValidator() {

    // -----------------------------------------------------------------------------
    // A custom function for the initial polynomial input.  This performs 
    // validation using jQuery.  Returns a boolean.  If the user input is 
    // invalid, then the form submission will not occur on the /index page.
    // -----------------------------------------------------------------------------
    this.validate = function () {
        // First, we grab the input and check if it is valid
        let input = getPolynomialInput(),
            isValid = false,
            hasRoots = false;

        if (input) {
            // Even if it is valid, we must check if any roots exist
            hasRoots = checkForRoots(input);
            console.log("HASROOTS:  " + hasRoots);

            if (hasRoots) {
                alert("It worked!"); // FOR DEBUGGING.  ERASE LATER!!!
                isValid = true;
            }
            else {
                displayNoRootsError();
            }
        }
        else {
            // Display different error message based on the past flow of events
            if (!hasRoots) {
                displayInputError();
            }
        }

        return isValid;
    }

    // CLASS METHODS - the following are solely for supporting the validate()
    //                 method.

    // -----------------------------------------------------------------------------
    // This is used to display the validation error on the index page, in the event
    // the user types invalid input.
    // -----------------------------------------------------------------------------
    function displayInputError() {
        alert("Invalid input :("); // FOR DEBUGGING.  ERASE LATER!!!
        $("#polyInputError").text("*Please enter a valid polynomial expression");
        $("#polyInput").val("");
    }

    // -----------------------------------------------------------------------------
    // This is used to display the validation error on the index page, in the event
    // the user input does not have any roots.
    // -----------------------------------------------------------------------------
    function displayNoRootsError() {
        alert("Doesn't have roots...awwwwwwwwww snaaaaaap"); // PLEASE...COME ON
        $("#polyInputError").text("*No rational roots exist.  Please try again.");
        $("#polyInput").val("");
    }

    // -----------------------------------------------------------------------------
    // Return the user input if it is valid, otherwise returns false
    // -----------------------------------------------------------------------------
    function getPolynomialInput() {
        let $input = $("#polyInput").val();
        let isValidInput = checkPolynomialInput($input);

        if (isValidInput) {
            return $input;
        }
        else {
            return false;
        }
    }

    // -----------------------------------------------------------------------------
    // Makes sure the input is properly formatted
    // -----------------------------------------------------------------------------
    function checkPolynomialInput(input) {
        let inputData = removeWhiteSpace(input),
            isValid = false;

        try {
            math.parse(inputData);
            console.log("INPUT:  " + inputData);

            if (REGEX_INPUT.test(inputData)) {
                isValid = true;
            }
        }
        catch (error) {
            console.log(error);
        }

        return isValid;
    }

    // -----------------------------------------------------------------------------
    // Returns true if the polynomial input has rational roots, false otherwise
    // -----------------------------------------------------------------------------
    function checkForRoots(poly) {
        let hasRoot = false,
            polyMatrix = toMatrix(poly); // convert to matrix form

        console.log("POLYMATRIX:  " + polyMatrix);
        console.log("TEST LENGTH:  " + FloPoly.allRoots(polyMatrix).length);
        console.log("TEST 0 EVAL:  " + FloPoly.evaluateAt0(polyMatrix));

        // If roots are returned from allRoots(), then rational roots exist
        if (FloPoly.allRoots(polyMatrix).length > 0 || FloPoly.evaluateAt0(polyMatrix) == 0) {
            hasRoot = true;
        }

        return hasRoot;
    }
}

//##############################################################################
//********************************END INPUT STAGE*******************************
//##############################################################################

//##############################################################################
//***************************RECOGNIZABLE FORMS STAGE***************************
//##############################################################################

// -----------------------------------------------------------------------------
// This section handles the calculations for stage FORMS.  Returns the 
// polynomial that was entered in reduced (but not factored) form, i.e. if the
// user enters 2x + 4x - 8, it would parse 6x - 8.
// -----------------------------------------------------------------------------
function RecognizableForms(polynomial) {
    // Displaying the polynomial 
    formsDisplay(polynomial);

    return polynomial;
}

// -----------------------------------------------------------------------------
// Used to locate the recognized forms in the polynomial and reduce it as much
// as possible.
// -----------------------------------------------------------------------------
function reducedFormPoly(polynomial) {

}

// -----------------------------------------------------------------------------
// Used to locate the recognized forms in a polynomial expression, such as
// a^2 - b^2, sum/dif of cubes, etc.
// -----------------------------------------------------------------------------
function findRecognizedForms(polynomial) {
    
}

// -----------------------------------------------------------------------------
// Used to locate the recognized form:  *DIFFERENCE OF TWO SQUARES*
// -----------------------------------------------------------------------------
function parseDifferenceTwoSquares(expression) {
        //var coefficients = polynomial.filter(function (node, path, parent) {
    //    return parent !== null && parent.op === "^" && node.isSymbolNode;
    //});
    //console.log(coefficients);
    //expression.traverse()
}

// -----------------------------------------------------------------------------
// Used to locate the recognized form:  *DIFFERENCE OF TWO CUBES*
// -----------------------------------------------------------------------------
function parseDifferenceTwoCubes(expression) {

}

// -----------------------------------------------------------------------------
// Used to locate the recognized form:  *SUM OF TWO CUBES*
// -----------------------------------------------------------------------------
function parseSumTwoCubes(expression) {

}

// -----------------------------------------------------------------------------
// Displaying the polynomial / reduced forms (returns void)
// -----------------------------------------------------------------------------
function formsDisplay(polynomial) {
    // This delineation makes it easier for understanding the types when passed
    // as parameters
    let recognizedForms,
        reducedPoly;

    displayAsBlock(polynomial, $("#formsInitPoly"));

    // Finding the special forms, separating them into variables as well
    // as the final reduced polynomial form
    //recognizedForms = findRecognizedForms(polynomial);
    //reducedPoly = reducedFormPoly(polynomial);
    //$("#formsDisplay").text("\\(" + recognizedForms + "\\");
    
}

//##############################################################################
//***************************END RECOGNIZE FORMS STAGE**************************
//##############################################################################

//##############################################################################
//**************************RATIONAL ZERO TEST STAGE****************************
//##############################################################################

//------------------------------------------------------------------------------
//                      CLASS:  RationalZeroTestDisplay 
//
//  Handles the display for the RZT class.
//------------------------------------------------------------------------------
function RationalZeroTestDisplay(RZT) {
    // Displaying p/q, possible roots, and then reduced roots.  If the latter
    // two are the same, then only displays once.
    this.display = function () {
        displayPQEquation(RZT.getPValues(), RZT.getQValues());
        let $pq = $("#rzt-pq"),
            $reduced = $("#rzt-pq-reduced");

        if (arraysAreEqual(RZT.getPositiveRoots(), RZT.getReducedPositiveRoots())) {
            $("#skip-pq").addClass("hidden");
            setOpeningBlockDelimeter($pq);
            iterateAndDisplay(RZT.getPositiveRoots(), $pq);
            setClosingBlockDelimeter($pq);
        }
        else {
            ("\\[").appendTo($pq, $reduced);
            iterateAndDisplay(RZT.getPositiveRoots(), $pq);
            iterateAndDisplay(RZT.getReducedPositiveRoots(), $reduced);
            ("\\]").appendTo($pq, $reduced);
        }

        // Necessary final laTex additions
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "rzt-p-over-q, rzt-pq, rzt-pq-reduced"]);
    }

    // -----------------------------------------------------------------------------
    // Displays all of the possible values for P and Q in the form of an equation, 
    // also uses +- through laTex formatting. Since both the P and Q are so tightly 
    // coupled, the function displays both instead of breaking apart and displaying
    // only one at a time.
    // -----------------------------------------------------------------------------
    function displayPQEquation(pValues, qValues) {
        // Displaying initial laTex, plus p/q 
        $("#rzt-p-over-q").append("\\[ {p\\over q} = {");
        iterateAndDisplay(pValues, $("#rzt-p-over-q"));
        // Displaying the line in between numerator and denominator
        $("#rzt-p-over-q").append("\\over");
        iterateAndDisplay(qValues, $("#rzt-p-over-q"));
        // Final, closing laTex
        $("#rzt-p-over-q").append("}\\]");
    }

    // -----------------------------------------------------------------------------
    // Iterates through each possible root discovered by the RZT and displays it
    // with +- through laTex formatting.
    // -----------------------------------------------------------------------------
    function iterateAndDisplay(roots, $id) {
        for (var i = 0; i < roots.length; ++i) {
            if (i === roots.length - 1) {
                $id.append("\\pm" + roots[i]);
            }
            else {
                $id.append("\\pm" + roots[i] + ", ");
            }
        }
    }
}

//------------------------------------------------------------------------------
//                          CLASS:  RationalZeroTest
//
//  This class will perform the calculations necessary to extract the 'p' and 
//  'q' values, which will also yield all of the possible roots in the 
//  polynomial input by the user.
//------------------------------------------------------------------------------

function RationalZeroTest(poly) {
    // Private instance variables
    let polynomial,
        pValues,
        qValues,
        positiveRoots,
        reducedPositiveRoots,
        allReducedRoots;

    // CONSTRUCTOR
    polynomial = poly;
    pValues = initiatePValues();
    qValues = initiateQValues();
    positiveRoots = posPOverQ();
    reducedPositiveRoots = reducedPosPOverQ();
    allReducedRoots = allReducedPOverQ();

    // ****ACCESSOR METHODS****
    this.getPValues = function () {
        return pValues;
    }

    this.getQValues = function () {
        return qValues;
    }

    this.getPositiveRoots = function () {
        return positiveRoots;
    }

    this.getReducedPositiveRoots = function () {
        return reducedPositiveRoots;
    }

    this.getAllReducedRoots = function () {
        return allReducedRoots;
    }

    // ****CLASS METHODS****  -- These methods are mainly used to perform all of
    // the calculations necessary to produce the P and Q value as well as the 
    // possible roots.  As such, they are not callable outside of this class.
    function initiatePValues() {
        let constant = Algebrite.coeff(polynomial, 0),
            multiplesP;

        console.log("CONSTANT: " + constant);
        multiplesP = getMultiples(constant);
        console.log("MULTIPLES of P:  " + multiplesP);
        return multiplesP;
    }

    function initiateQValues() {
        let leading = Algebrite.leading(polynomial),
            multiplesQ;

        console.log("LEADING: " + leading);
        multiplesQ = getMultiples(leading);
        console.log("MULTIPLES of Q:  " + multiplesQ);
        return multiplesQ;
    }

    // -----------------------------------------------------------------------------
    // This performs P/Q in a polynomial P(x) and returns a REDUCED list of possible
    // rational roots in P(x).  NOTE - it only returns the positive version for 
    // ease of display in RZTFlow.
    // -----------------------------------------------------------------------------
    function reducedPosPOverQ() {
        let possibleRoots = new Set();

        if (pValues.length > 0 && qValues.length > 0) {
            pValues.forEach(function (P) {
                qValues.forEach(function (Q) {
                    possibleRoots.add(P / Q);
                });
            });
        }

        return Array.from(possibleRoots);
    }

    // -----------------------------------------------------------------------------
    // This performs P/Q in a polynomial P(x) and returns a TOTAL list of possible
    // rational roots in P(x).  NOTE - it only returns the positive version, hence,
    // pseudo.  This is done for ease of display.
    // -----------------------------------------------------------------------------
    function posPOverQ() {
        let possibleRoots = [];

        if (pValues.length > 0 && qValues.length > 0) {
            pValues.forEach(function (P) {
                qValues.forEach(function (Q) {
                    possibleRoots.push(P / Q);
                });
            });
        }

        return possibleRoots;
    }

    // -----------------------------------------------------------------------------
    // This performs P/Q in a polynomial P(x) and returns a REDUCED list of ALL 
    // possible rational roots in P(x).
    // -----------------------------------------------------------------------------
    function allReducedPOverQ() {
        let possiblePosRoots = new Set(),
            possibleNegRoots = new Set();

        if (pValues.length > 0 && qValues.length > 0) {
            pValues.forEach(function (P) {
                qValues.forEach(function (Q) {
                    possiblePosRoots.add(P / Q);   // Adds the positive version
                    possibleNegRoots.add(-(P / Q)) // Adds the negative version
                    // Given these numbers are NOT in the set
                });
            });
        }

        let arrPos = Array.from(possiblePosRoots),
            arrNeg = Array.from(possibleNegRoots);

        return { pos: arrPos, neg: arrNeg };
    }

    // -----------------------------------------------------------------------------
    // This finds all multiples of a number based on a brute force technique which 
    // traverses all numbers less than the given number.  This technique could be 
    // optimized, but for now, it serves its purpose.
    // -----------------------------------------------------------------------------
    function getMultiples(number) {
        // Handle case of negative numbers.  Also, the number is converted to 
        // string because it was parsed using Algebrite and was an object
        number = math.abs(number.toString());

        if (number == 1 || number == 0) {
            return [number];
        }
        // Have to check this way for true values 
        else if (math.isPrime(number)) {
            return [1, number];
        }
        else {
            // There are multiple ways to do this, but the simplest seems to just
            // go through and check if the number is divisible by all nums <= HALF 
            // the original number.  The multiples will always include the number 1 
            // plus the number itself.
            let possibleMultiple = 2,
                multiples = [1],
                halfOfNumber = number / 2;

            while (possibleMultiple <= halfOfNumber) {
                if (number % possibleMultiple === 0) {
                    multiples.push(possibleMultiple);
                }

                possibleMultiple++;
            }

            multiples.push(number);
            return multiples;
        }
    }
}

//##############################################################################
//*************************END RATIONAL ZERO TEST STAGE*************************
//##############################################################################

//##############################################################################
//********************************DESCARTES' STAGE******************************
//##############################################################################

//------------------------------------------------------------------------------
//                           CLASS:  DescartesDisplay
//
//  This class handles the display of the Descartes Object passed to it.
//  Dependencies:   FloPoly Library,
//                  toMatrix & toPolynomial utility functions
//                  displayAsBlock & displayInline functions (Make Class?) 
//------------------------------------------------------------------------------
function DescartesDisplay(descartes) {
    this.display = function () {
        displayAsBlock(descartes.getPolynomial(), $("#descartes-poly-positive"));
        displayAsBlock(descartes.getNegPolynomial(), $("#descartes-poly-negative"));

        // POSITIVE
        displayRootCount($("#positive-sign-changes"),
            $("#no-positive"),
            $("#possible-positive-roots"),
            "Positive Roots",
            descartes.getPosSignChanges(),
            descartes.getPossiblePositives()
        );

        // NEGATIVE
        displayRootCount($("#negative-sign-changes"),
            $("#no-negative"),
            $("#possible-negative-roots"),
            "Negative Roots",
            descartes.getNegSignChanges(),
            descartes.getPossibleNegatives()
        );

        // Final cleanup/LaTex operations
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "descartes-poly-positive,\
                                                descartes-poly-negative,\
                                                positive-sign-changes,  \
                                                negative-sign-changes,  \
                                                possible-positive-roots,\
                                                possible-negative-roots"]);
    }

    // -----------------------------------------------------------------------------
    // Handler function that displays when no multiples exist below the given
    // signChanges param, which represents total possible pos/neg roots.
    // -----------------------------------------------------------------------------
    function noMultiplesHandler(signChanges, $id) {
        if (signChanges < 2) {
            $id.append("However, this doesn't apply in this case, as " +
                signChanges + " has no lower multiples.");
        }
    }

    // -----------------------------------------------------------------------------
    // Aids in displaying the positive or negative root counts
    // -----------------------------------------------------------------------------
    function displayRootCount($signChange, $noRoot, $possibleRoot, rootType,
                              funcSignChanges, funcPossibleRoots) {
        displayInline(funcSignChanges, $signChange);
        noMultiplesHandler(funcSignChanges, $noRoot);
        $possibleRoot.append("\\[\\text{" + rootType + ":  }" + funcPossibleRoots + "\\]");
    }

}

//------------------------------------------------------------------------------
//                              CLASS:  Descartes
//
//  This class will determine the number of sign changes in the polynomial and
//  extract the total possible number of positive and negative roots in the 
//  polynomial.
//  Dependencies:   FloPoly Library,
//                  toMatrix & toPolynomial utility functions
//------------------------------------------------------------------------------
function Descartes(poly) {
    // PRIVATE INSTANCE VARS
    let polynomial,
        posPolyMatrix,
        negPolyMatrix,
        negPolynomial,
        posSignChanges,
        negSignChanges,
        possiblePositives,
        possibleNegatives;

    // CONSTRUCTOR
    polynomial = poly;
    posPolyMatrix = toMatrix(polynomial);
    negPolyMatrix = FloPoly.reflectAboutYAxis(toMatrix(polynomial));
    negPolynomial = toPolynomial(negPolyMatrix);
    posSignChanges = FloPoly.signChanges(posPolyMatrix);
    negSignChanges = FloPoly.signChanges(negPolyMatrix);
    possiblePositives = descartesRule(posSignChanges);
    possibleNegatives = descartesRule(negSignChanges);

    // ACCESSORS 
    this.getPolynomial = function () {
        return polynomial;
    }

    this.getNegPolynomial = function () {
        return negPolynomial;
    }

    this.getPosSignChanges = function () {
        return posSignChanges;
    }

    this.getNegSignChanges = function () {
        return negSignChanges;
    }

    this.getPossiblePositives = function () {
        return possiblePositives; 
    } 

    this.getPossibleNegatives = function () {
        return possibleNegatives;
    }

    this.getDescartes = function () {
        return { pos: possiblePositives, neg: possibleNegatives };
    }

    // -----------------------------------------------------------------------------
    // A simple function that finds all values less than a given number by 2, while
    // > 0. It returns this list of numbers, which also contains the original number
    // -----------------------------------------------------------------------------
    function descartesRule(signChanges) {
        let possibleValues = [];

        while (signChanges >= 0) {
            possibleValues.push(signChanges);
            signChanges -= 2;
        }

        return possibleValues;
    }
}

//##############################################################################
//*******************************END DESCARTES' STAGE***************************
//##############################################################################

//##############################################################################
//*********************************SYNTHETIC STAGE******************************
//##############################################################################

// -----------------------------------------------------------------------------
//                      CLASS: SyntheticDivisionDisplay
//
// This class handles the display of the synthetic division that is performed on
// each attempted root.  This class will occur asynchronously from within the 
// SyntheticDivision class whenever a root is clicked by the user.
// -----------------------------------------------------------------------------
function SyntheticDivisionDisplay(root, polynomial, result) {
    this.display = function () {
        console.log("ROOT:" + root);
        console.log("POLYNOMIAL:  " + polynomial);
        console.log("RESULT:" + result);
    }
}

// -------------------------CLASS:  Synthetic Division--------------------------
// -----------------------------------------------------------------------------
// This class will handle the calculations for synthetic division.  Even though
// this is the main purpose, the class will also contain 'onClick' handlers 
// which will be responsible for creating SDDisplay objects.
// -----------------------------------------------------------------------------
function SyntheticDivision(poly, possibleRoots, numberRoots) {
    // Creating duplicates/modified versions of the parameters for manipulation
    let posRootCount = numberRoots.pos,
        negRootCount = numberRoots.neg,
        maxRoots = posRootCount[0] + negRootCount[0],
        posRoots = possibleRoots.pos,
        negRoots = possibleRoots.neg,
        guessedPositive = [],
        guessedNegative = [],
        polynomial = poly;

    //changeDisplay(fromStage, toStage);
    totalDisplay(posRootCount, negRootCount, $("#syn-total-pos"), $("#syn-total-neg"));
    initialRootsDisplay(posRoots, negRoots, "#syn-pos-roots", "#syn-neg-roots");
    setAsyncRootHandlers(polynomial, posRoots, "#pos");
    setAsyncRootHandlers(polynomial, negRoots, "#neg");

    console.log("POSITIVE COUNT:  " + posRootCount);
    console.log("NEGATIVE COUNT:  " + negRootCount);
    console.log("MAX ROOTS:  " + maxRoots);
    console.log("POSITVE ROOTS:  " + posRoots);
    console.log("NEGATIVE ROOTS:  " + negRoots);

    // Final cleanup/LaTex operations
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, "syn-total-pos, syn-total-neg"]);

    //------------------------------------------------------------------------------
    //  Used to display the total count for both pos and neg roots.
    //------------------------------------------------------------------------------
    function totalDisplay(posRootCount, negRootCount, $posId, $negId) {
        $posId.append("\\[\\text{Pos. Root Count:  }" + posRootCount + "\\]");
        $negId.append("\\[\\text{Neg. Root Count:  }" + negRootCount + "\\]");
    }

    //------------------------------------------------------------------------------
    //  Used to set the initial ID values for the possible roots in the html
    //  NOTE:  This does not use MathJax to display.
    //------------------------------------------------------------------------------
    function initialRootsDisplay(posRoots, negRoots, posParentId, negParentId) {
        $(posParentId).append("Pos:");
        for (let i = 0; i < posRoots.length; ++i) {
            $("<span>\\(" + posRoots[i] + "\\)</span>").appendTo(posParentId).attr({
                "id": "pos" + i,
                "class": "span-space"
            });
        }

        $(negParentId).append("Neg:");
        for (let i = 0; i < negRoots.length; ++i) {
            $("<span>\\(" + negRoots[i] + "\\)</span>").appendTo(negParentId).attr({
                "id": "neg" + i,
                "class": "span-space"
            });
        }
    }

    //--------------------------------------------------------------------------
    //  Used to mark out roots that have already been guessed 
    //--------------------------------------------------------------------------
    function cancelRoots(roots, guessed, id) {
        for (let i = 0; i < roots.length; ++i) {
            if (guessed[i]) {
                $(id + i).text("\\(\\cancel{" + roots[i] + "}\\)")
            }
        }
    }

    //--------------------------------------------------------------------------
    //  Sets all of the 'onClick' handlers for each root available.  The handlers
    //  are fired based on which numbers are clicked.
    //--------------------------------------------------------------------------
    function setAsyncRootHandlers(polynomial, roots, id) {
        for (let i = 0; i < roots.length; ++i) {
            let root = roots[i];
            $(id + i).on("click", function () {
                let result = synDivide(polynomial, root);

                if (root > 0) {
                    guessedPositive.push(root);
                }
                else if (root < 0) {
                    guessedNegative.push(root);
                }
                else { // Did we handle this???
                    // ????
                }

                // Displaying based on the current choice
                let synDisplay = new SyntheticDivisionDisplay(root, polynomial, result);
                synDisplay.display();

                let finished = updateRoots(result, roots, guessedPositive, guessedNegative);
                if (finished) {
                    // CANCEL ALL, return roots
                }
                else {
                    // CANCEL only ROOT
                    // UPDATE GUESSES
                }
            });
        }
    }

    //--------------------------------------------------------------------------
    //  Keeps up with the state of the guesses
    //--------------------------------------------------------------------------
    function updateRoots(result, roots, guessedPositive, guessedNegative) {
        // STUB - finish later
        return false;
    }


    //--------------------------------------------------------------------------
    //  Performs synthetic division on the polynomial and returns the remainder
    //--------------------------------------------------------------------------
    function synDivide(polynomial, root) {
        let top = toMatrix(polynomial),
            middle = [],
            bottom = [],
            N = Algebrite.deg(polynomial);

        for (let i = 0; i <= N; ++i) {
            if (i === 0) {
                bottom.push(top[i]);
                middle.push(bottom[i] * root);
            }
            else if (i === N) {
                bottom.push(top[i] - middle[i - 1]);
            }
            else {
                bottom.push(top[i] - middle[i - 1]);
                middle.push(bottom[i] * root);
            }
        }

        // This is the last position: the remainder
        return bottom[N];
    }
}

//##############################################################################
//*******************************END SYNTHETIC STAGE****************************
//##############################################################################

//##############################################################################
//***********************************FINAL STAGE********************************
//##############################################################################

// -----------------------------------------------------------------------------
// The flow of the program picks up here from the SYNTHETIC stage, moving
// towards the FINAL stage.  This function is triggered by the onClick button
// from STAGE SYNTHETIC.
// -----------------------------------------------------------------------------
function FinalRecap(polynomial, actualRoots) {
    // TODO
}

//##############################################################################
//*********************************END FINAL STAGE******************************
//##############################################################################

//##############################################################################
//*************************************MAIN*************************************
//##############################################################################

// -----------------------------------------------------------------------------
// The main function is the entry point into the flow of the program.  It will
// break the program into the various STAGES necessary for displaying the 
// tutorial.  The main function first waits for a form submit to validate the
// user input.  After this, the program executes the FORMS stage.  The stages
// will move from one to the next as the user presses the 'Continue' button.
// -----------------------------------------------------------------------------
var main = function () {
    "use strict";

    // Validates the user input from the form submission
    $("form").on("submit", function () {
        return new InputValidator().validate();
    });

    // Helps cut down on the total amount of HTTP requests.
    if (top.location.pathname === '/Tutorial') {
        let polynomial,         // POLYNOMIAL for all stages
            allPossibleRoots,   // For RZT         
            numberOfRoots,      // For DESCARTES
            actualRoots;        // For SYNTHETIC

//###################################FORMS######################################

        // TODO !!!!!! FINISH this part!
        // Grabbing the data attribute set from the server, which was stored by
        // the Model class.  This is quicker than contacting the server.
        polynomial = combineTerms($("#initialBackendPolyString").data("poly"));
        let recogForms = new RecognizableForms(polynomial),
            stage = new Stage(FORMS);
        // TODO - will need a display function here, instead of in recogForms
        stage.markStageCompleted(FORMS);
        changeDisplay(stage.getCurrentStage(), FORMS);

        // REDO FORMS stage when tab clicked - essentially, start over.
        $("#FORMS-tab").on("click", function () {
            if (stage.isCompleted(RZT)) {
                stage.setStage(stage.getCurrentStage(), 
                    changeDisplay(stage.getCurrentStage(), FORMS));
            }
        });

//#################################END_FORMS####################################

//####################################RZT#######################################

        $("#FORMS-to-RZT").on("click", function () {
            if (stage.isCompleted(RZT)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), RZT));
            }
            else {
                var rational = new RationalZeroTest(polynomial),
                    rationalDisplay = new RationalZeroTestDisplay(rational);
                rationalDisplay.display();
                stage.markStageCompleted(RZT);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), RZT));
                allPossibleRoots = rational.getAllReducedRoots(); // for use later
            }
        });

        // REDO RZT stage if have made it past it
        $("#RZT-tab").on("click", function () {
            if (stage.isCompleted(DESCARTES)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), RZT));
            }
        });

//###################################END_RZT####################################

//##################################DESCARTES###################################

        $("#RZT-to-DESCARTES").on("click", function () {
            if (stage.isCompleted(DESCARTES)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), DESCARTES));
            }
            else {
                var descartes = new Descartes(polynomial),
                    descartesDisplay = new DescartesDisplay(descartes);
                descartesDisplay.display();
                stage.markStageCompleted(DESCARTES);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), DESCARTES));
                numberOfRoots = descartes.getDescartes();  // for use later
            }
        });

        // Redo DESCARTES stage if have made it past it
        $("#DESCARTES-tab").on("click", function () {
            if (stage.isCompleted(SYNTHETIC)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), DESCARTES));
            }
        });

//################################END_DESCARTES#################################

//##################################SYNTHETIC###################################

        $("#DESCARTES-to-SYNTHETIC").on("click", function () {
            if (stage.isCompleted(SYNTHETIC)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), SYNTHETIC));
            }
            else {
                var syn = new SyntheticDivision(polynomial, allPossibleRoots, numberOfRoots);
                // HANDLE DISPLAY - synthetic division
                stage.markStageCompleted(SYNTHETIC);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), SYNTHETIC));
                // SET actualRoots
            }
        });

        // Redo SYNTHETIC stage if already past it
        $("#SYNTHETIC-tab").on("click", function () {
            if (stage.isCompleted(FINAL)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), SYNTHETIC));
            }
        });

//################################END_SYNTHETIC#################################

//####################################FINAL#####################################

        $("#SYNTHETIC-to-FINAL").on("click", function () {
            if (stage.isCompleted(FINAL)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), FINAL));
            }
            else {
                var fin = new FinalRecap(polynomial, actualRoots);
                // HANDLE DISPLAY - FinalRecap 
                stage.markStageCompleted(FINAL);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), FINAL));
            }
        });

        // Allow this tab to be clicked only once truly finished
        $("#FINAL-tab").on("click", function () {
            if (stage.isCompleted(FINAL)) {
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), FINAL));
            }
        });

//##################################END_FINAL###################################
    }
};

//##############################################################################
//**********************************END MAIN************************************
//##############################################################################

//##############################################################################
//***************************MISCELLANEOUS FUNCTIONS****************************
//##############################################################################

// -----------------------------------------------------------------------------
// Used to display a numerical value or expression in LaTex form, block format
// -----------------------------------------------------------------------------
function displayAsBlock(expression, $id) {
    $id.append("\\[{" + expression + "}\\]");
}

// -----------------------------------------------------------------------------
// Used to display a numerical value or expression in LaTex form, inline format
// -----------------------------------------------------------------------------
function displayInline(expression, $id) {
    $id.append("\\(" + expression + "\\)");
}

// -----------------------------------------------------------------------------
// Appends an opening BLOCK formatter for LaTex representation
// -----------------------------------------------------------------------------
function setOpeningBlockDelimeter($id) {
    $id.append("\\[");
}

// -----------------------------------------------------------------------------
// Appends a closing BLOCK formatter for LaTex representation
// -----------------------------------------------------------------------------
function setClosingBlockDelimeter($id) {
    $id.append("\\]");
}

// -----------------------------------------------------------------------------
// Appends an opening INLINE formatter for LaTex representation
// -----------------------------------------------------------------------------
function setOpeningInlineDelimeter($id) {
    $id.append("\\(");
}

// -----------------------------------------------------------------------------
// Appends a closing INLINE formatter for LaTex representation
// -----------------------------------------------------------------------------
function setClosingInlineDelimeter($id) {
    $id.append("\\)");
}

// -----------------------------------------------------------------------------
// Handles the transition from each stage to the next.  Also, returns the new 
// STAGE for convenience.
// -----------------------------------------------------------------------------
function changeDisplay(prevStage, curStage) {
    changeActiveSection(prevStage, curStage);
    changeHeading(curStage);
    displayStageContent(prevStage, curStage);

    return curStage;
}

// -----------------------------------------------------------------------------
// Marks the previous stage as hidden, and the current one as active
// -----------------------------------------------------------------------------
function displayStageContent(prevStage, curStage) {
    $(STAGE_CONTENT[prevStage]).addClass("hidden");
    $(STAGE_CONTENT[curStage]).removeClass("hidden");
}

// -----------------------------------------------------------------------------
// Changes the section heading on the left side of html page.  The magic numbers
// '+1' are needed b/c the nth-child selector method is 1-indexed.
// -----------------------------------------------------------------------------
function changeActiveSection(prevStage, curStage) {
    $(".list-group-item:nth-child(" + (prevStage + 1) + ")").removeClass("active");
    $(".list-group-item:nth-child(" + (curStage + 1) + ")").addClass("active");
}

// -----------------------------------------------------------------------------
// Changes the title heading for the current section
// -----------------------------------------------------------------------------
function changeHeading(stage) {
    let heading = selectStageHeading(stage);
    $("h3").empty();
    $("h3").text(heading);
    $("h3").prepend("<i class='glyphicon glyphicon-education'></i>");
}

// -----------------------------------------------------------------------------
// Simply returns the stage title
// -----------------------------------------------------------------------------
function selectStageHeading(stage) {
    switch (stage) {
        case FORMS:
            return "Recognizable Forms";
        case RZT:
            return "Rational Zero Test";
        case DESCARTES:
            return "Descartes' Rule of Signs";
        case SYNTHETIC:
            return "Synthetic Division";
        case FINAL:
            return "Final";

        default: return "";
    }
}

// -----------------------------------------------------------------------------
// Used to compare two arrays
// -----------------------------------------------------------------------------
function arraysAreEqual(arrayA, arrayB) {
    if (arrayA === arrayB) return true;
    if (arrayA == null || arrayB == null) return false;
    if (arrayA.length != arrayB.length) return false;

    arrayA.sort();
    arrayB.sort();

    for (var i = 0; i < arrayA.length; ++i) {
        if (arrayA[i] !== arrayB[i]) return false;
    }
    return true;
}

// -----------------------------------------------------------------------------
// A function to change a polynomial expressed as a string ("x^2 +x-3") into a
// matrix form -> [1, 1, -3], where each number represents the coefficient of 
// its respective degree (starting from 0 degree at the right).
// -----------------------------------------------------------------------------
function toMatrix(poly) {
    let polyMatrix = [],
        N = Algebrite.deg(poly);

    for (var i = N; i >= 0; --i) {
        // Another workaround for Algebrite.  The coefficient object represents
        // a number but first must be converted to string, then parsed as int
        polyMatrix.push(parseInt(Algebrite.coeff(poly, i).toString()));
    }

    return polyMatrix;
}

// -----------------------------------------------------------------------------
// A function to change a matrix expressed as an array, ex. -> [1, 1, -3], into 
// a string -> "x^2 +x-3". In the matrix, each number represents the coefficient
// of its respective degree (starting from 0 degree at the right).
// -----------------------------------------------------------------------------
function toPolynomial(matrix) {
    let N = matrix.length,
        reversed = [],
        poly;

    for (var i = N-1; i >= 0; --i) {
        reversed.push(matrix[i]);
    }

    poly = new Polynomial(reversed);

    return poly.toString();
}

// -----------------------------------------------------------------------------
// Makes sure that any terms entered by user are combined, if possible
// -----------------------------------------------------------------------------
function combineTerms(polynomial) {
    // Just to make sure, put it in string form
    polynomial = polynomial.toString();
    return Algebrite.run(polynomial);
}

// -----------------------------------------------------------------------------
// Removes whitespace in input so the Polynomial can be created properly
// -----------------------------------------------------------------------------
function removeWhiteSpace(string) {
    return string.split(" ").join("");
}

//##############################################################################
//**************************END MISCELLANEOUS FUNCTIONS*************************
//##############################################################################
$(document).ready(main);