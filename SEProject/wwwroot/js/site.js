//**********************************SITE.JS*************************************
//
// Entry point for SEProject.  This file controls the interactive display of the
// website.  There are only two HTML pages - the latter page is displayed by
// most of the JS functions in this file.
// 
//******************************************************************************

// Initial constant declarations.  The regex is used for input validation, 
// whereas the rest are enumerations of the stages of the program plus the 
// content html for each stage.

const REGEX = /[^0-9x^()+*/-]/,
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

// for rational coefficients
Polynomial.setField("Q");

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
            polyProperties;

        if (input) {
            // Even if it is valid, we must check if any roots exist
            polyProperties = checkForRoots(input);
            console.log("HASROOTS:  " + polyProperties.hasRoots);
            console.log("INVALID DEGREE " + polyProperties.invalidDegree);


            if (polyProperties.invalidDegree) {
                displayDegreeError();
            }
            else if (polyProperties.hasRoots) {
                isValid = true;
            }
            else {
                displayNoRootsError();
            }
        }
        else {
            // Display different error message based on the past flow of events
            //if (!polyProperties.hasRoots) {
            displayInputError();
            //}
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
        $("#polyInputError").text("*Please enter a valid polynomial expression");
        $("#polyInput").val("");
    }

    // -----------------------------------------------------------------------------
    // This is used to display the validation error on the index page, in the event
    // the user input does not have any roots.
    // -----------------------------------------------------------------------------
    function displayNoRootsError() {
        $("#polyInputError").text("*No rational roots exist.  Please try again.");
        $("#polyInput").val("");
    }

    // -----------------------------------------------------------------------------
    // This is used to display the validation error on the index page, in the event
    // the user inputs a polynomial higher than the 10th degree.
    // -----------------------------------------------------------------------------
    function displayDegreeError() {
        $("#polyInputError").text("*Please limit input to below the 10th degree.");
        $("#polyInput").val("");
    }

    // -----------------------------------------------------------------------------
    // Return the user input if it is valid, otherwise returns false
    // -----------------------------------------------------------------------------
    function getPolynomialInput() {
        let input = $("#polyInput").val();
        let isValidInput = checkPolynomialInput(input);

        if (isValidInput) {
            return input;
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
            let parsed = math.parse(inputData);
            console.log("PARSED: " + parsed);
            console.log("INPUT:  " + inputData);
            console.log("REGEX:  " + REGEX.test(inputData))

            if (!(REGEX.test(inputData))) {
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
        let hasRoot = false;

        try {
            let initParse = math.simplify(math.parse(poly)).toString();
            console.log("INITIAL PARSE:  " + initParse);
            let expanded = combineLikeTerms(initParse);
            let polyMatrix = toMatrix(expanded),
                degree = FloPoly.degree(polyMatrix);

            console.log("THIS IS THE DEGREE OF POLYMATRIX:  " + degree);

            if (degree >= 10) {
                return { invalidDegree: true, hasRoot: hasRoot };
            }

            let roots = FloPoly.allRoots(polyMatrix),
                rootTest = roots.length,
                zeroRootTest = FloPoly.evaluateAt0(polyMatrix);

            console.log("POLYMATRIX:  " + polyMatrix);
            console.log("ALL ROOTS:  " + roots);
            console.log("TEST LENGTH:  " + rootTest);
            console.log("TEST 0 EVAL:  " + zeroRootTest);
            alert("Wait a sec...");

            // If roots are returned from allRoots(), then rational roots exist
            if (degree > 3 && (rootTest > 0 || zeroRootTest == 0) || hasRational(roots)) {
                hasRoot = true;
            }
            else if ((rootTest > 0 || zeroRootTest == 0) || hasRational(roots)) {
                hasRoot = true;
            }
        }
        catch (error) {
            console.log(error);
        }

        return { invalidDegree: false, hasRoots: hasRoot };
    }

    // -------------------------------------------------------------------------
    // Checks if the roots contain irratonal numbers
    // -------------------------------------------------------------------------
    function hasRational(roots) {
        let error,
            rounded,
            rationalCount = 0;

        const pass = 0.000000000001;

        roots.forEach(function (root) {
            if (!Number.isInteger(root) && findPrecision(root) >= 12) {
                rounded = Math.round10(root, -1);
                error = Math.abs(root - rounded); // checking if close to int
                console.log("#####THE ROOT#####" + root);
                console.log("-----ROUNDED------" + rounded);
                console.log("*******ERROR******" + error);
                if (error < pass) {
                    rationalCount += 1;
                }
                console.log(" .... AND NOW THE RATIONAL ROOT COUNT" + rationalCount);
            }
            else {
                rationalCount += 1;
            }
        });

        if (rationalCount > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Calculates the precision of a number, if it has a decimal
    // -------------------------------------------------------------------------
    function findPrecision(number) {
        let numString = number.toString();
        return (numString.split('.')[1] || []).length;
    }
}

//##############################################################################
//********************************END INPUT STAGE*******************************
//##############################################################################

//##############################################################################
//***************************RECOGNIZABLE FORMS STAGE***************************
//##############################################################################

// -----------------------------------------------------------------------------
//                          CLASS:  RECOGNIZEDFORMSDISPLAY
//
// Displaying the polynomial / reduced forms (returns void)
// -----------------------------------------------------------------------------
function RecognizableFormsDisplay(poly, forms) {

    this.display = function () {
        displayAsBlock(poly, $("#forms-init-poly"));

        let factors = forms.getFactors(),
            sumCubes = forms.getSumCubesTotal(),
            difCubes = forms.getDifCubesTotal(),
            difSquares = forms.getDifSquaresTotal(),
            complex = forms.getIrrationalOrComplexTerms(),
            complexRootCount = forms.getComplexRootCount(),
            finalRoots = forms.getFinalRoots(),
            reduced = forms.getReduced(),
            hasForms = forms.getHasForms(),
            hasFactors = forms.getHasFactors(),
            hasBeenReduced = false,
            wasOnlyReduced = false;

        if (hasForms && hasFactors) {
            displayFull(difSquares, difCubes, sumCubes, factors);
            hasBeenReduced = true;
        }
        else if (hasForms) {
            displayOnlyForms(difSquares, difCubes, sumCubes);
            hasBeenReduced = true;
        }
        else if (hasFactors) {
            displayOnlyFactors(factors);
            hasBeenReduced = true;
        }
        else if (forms.wasOnlyReduced()) {
            displayOnlyReduced(reduced);
            wasOnlyReduced = true;
        }
        else {
            displayNone();
        }

        if (complexRootCount > 0) {
            displayComplex(complex);
            hasBeenReduced = true;
        }

        if (hasBeenReduced && reduced) {
            displayFinal(reduced, finalRoots);
        }
        else if (wasOnlyReduced && reduced) {
            // do nothing, already displayed reduced form.
        }
        else if (hasBeenReduced && !(reduced)) {
            displayFinished();
        }
        else {
            displayNull();
        }

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "forms-init-poly, forms-content"]);
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  Has both special forms and normal factors
    // -------------------------------------------------------------------------
    function displayFull(difSquares, difCubes, sumCubes, factors, reduced) {
        $(".forms-content").append('<p class="p-items">' +
            'We can pull out the following special forms:</p >');

        displayForms(difSquares, difCubes, sumCubes);

        $(".forms-content").append('<p class="p-items">' +
            'We can also also reduce the polynomial and pull out the ' +
            'following factors:</p >');

        displayFactors(factors);
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  Has special forms, but no normal factors
    // -------------------------------------------------------------------------
    function displayOnlyForms(difSquares, difCubes, sumCubes) {
        $(".forms-content").append('<p class="p-items">' +
            'We can pull out the following special forms:</p >');

        displayForms(difSquares, difCubes, sumCubes);
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  No special forms, but has factors
    // -------------------------------------------------------------------------
    function displayOnlyFactors(factors) {
        $(".forms-content").append('<p class="p-items">' +
            'We cannot pull out any special forms.  However, we can reduce ' +
            'the polynomial and pull out the following factors:  </p >');

        displayFactors(factors);
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  No special forms nor factors, but has factored out a 
    // constant.
    // -------------------------------------------------------------------------
    function displayOnlyReduced(reduced) {
        $(".forms-content").append('<p class="p-items">' +
            'We cannot pull out any special forms.  However, we can simplify ' +
            'the polynomial to a reduced form.</p >');

        $(".forms-content").append('\\[' + reduced + '\\]');
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  Contains neither special forms nor factors
    // -------------------------------------------------------------------------
    function displayNone() {
        $(".forms-content").append('<p class="p-items">' +
            'We cannot pull out any special forms, nor can we reduce the ' +
            'polynomial through factoring. </p >');
    }

    // -------------------------------------------------------------------------
    // For the BRANCH:  When reduction completely factors the expression
    // -------------------------------------------------------------------------
    function displayFinished() {
        $(".forms-content").append('<p class="p-items">' +
            'The polynomial has been reduced to its lowest form.  No further ' +
            'stages are necessary. <a href="http://localhost:53945/Index"> Click here</a> to ' +
            'enter another polynomial. </p > ');
        $("#FORMS-to-RZT").addClass("hidden");
    }

    // -------------------------------------------------------------------------
    // Helper to display forms
    // -------------------------------------------------------------------------
    function displayForms(difSquares, difCubes, sumCubes) {
        if (difSquares.length > 0) {
            $(".forms-content").append('\\[' + difSquares + '\\]');
        }

        if (difCubes.length > 0) {
            $(".forms-content").append('\\[' + difCubes + '\\]');
        }

        if (sumCubes.length > 0) {
            $(".forms-content").append('\\[' + sumCubes + '\\]');
        }
    }

    // -------------------------------------------------------------------------
    // Helper to display factors
    // -------------------------------------------------------------------------
    function displayFactors(factors) {
        $(".forms-content").append('\\[' + factors + '\\]');
    }

    // -------------------------------------------------------------------------
    // Helper to display imaginary or irrational factors
    // -------------------------------------------------------------------------
    function displayComplex(complex) {
        $(".forms-content").append('<p class="p-items">' +
            'In this case, the polynomial contains a pair of complex roots in ' +
            'the following expression: </p >\\[' + complex + '\\]');
    }

    // -------------------------------------------------------------------------
    // Helper to display the final, reduced polynomial
    // -------------------------------------------------------------------------
    function displayFinal(reduced, roots) {
        $(".forms-content").append('<p class="p-items">' +
            'The polynomial has now been reduced to the following form:</p >\\[' +
            reduced + '\\] <p class="p-items"> The following roots were discovered:</p >\\[' +
            roots + '\\]');
    }

    // -------------------------------------------------------------------------
    // Helper to display the final case in which no reductions whatsoever have
    // occured
    // -------------------------------------------------------------------------
    function displayNull() {
        $(".forms-content").append('<p class="p-items">' +
            'The polynomial must be analyzed through other means in order to ' + 
            'reduced it further.');
    }
}

// -----------------------------------------------------------------------------
//                              CLASS:  RECOGNIZEDFORMS
//
// This class will noticed any special forms in the polynomial, as well as any
// terms that have already been factored.
// -----------------------------------------------------------------------------
function RecognizableForms(poly) {
    let init,
        polynomial,
        factors = [],
        sumCubes = [],
        sumCubesTotal = [],
        difCubes = [],
        difCubesTotal = [],
        difSquares = [],
        difSquaresTotal = [],
        allTerms = [],
        reducedTerms = [],
        irrationalOrComplexTerms = [],
        complexRootCount = 0,
        finalRoots = [],
        finalFactors = [],
        reduced = "",
        hasForms = false,
        hasFactors = false,
        isMult;

    // CONSTRUCTOR
    init = removeWhiteSpace(poly);
    polynomial = formsSimplify(poly);
    hasForms = depthFirstParse(polynomial);
    hasFactors = factorCheck();
    reduced = parseReducedTerms();
    finalFactors = parseFinalFactors();

    console.log("#####################REDUCED_POLYNOMIAL#################" + reduced);
    console.log("*************************FINAL_ROOTS*********************" + finalRoots);
    console.log("************************FINAL_FACTORS*********************" + finalFactors);

    this.getInit = function () {
        return init;
    }

    this.getPolynomial = function () {
        return polynomial;
    }

    this.getFactors = function () {
        return factors;
    }

    this.getSumCubes = function () {
        return sumCubes;
    }

    this.getDifCubes = function () {
        return difCubes;
    }

    this.getDifSquares = function () {
        return difSquares;
    }

    this.getSumCubesTotal = function () {
        return sumCubesTotal;
    }

    this.getDifCubesTotal = function () {
        return difCubesTotal;
    }

    this.getDifSquaresTotal = function () {
        return difSquaresTotal;
    }

    this.getAllTerms = function () {
        return allTerms;
    }

    this.getReducedTerms = function () {
        return reducedTerms;
    }

    this.getIrrationalOrComplexTerms = function () {
        return irrationalOrComplexTerms;
    }

    this.getComplexRootCount = function () {
        return complexRootCount;
    }

    this.getFinalRoots = function () {
        return finalRoots;
    }

    this.getFinalFactors = function () {
        return finalFactors;
    }

    this.getReduced = function () {
        return reduced;
    }

    this.getHasForms = function () {
        return hasForms;
    }

    this.getHasFactors = function () {
        return hasFactors;
    }

    this.wasOnlyReduced = function () {
        return checkOnlyReduced();
    }

    // -------------------------------------------------------------------------
    // Chooses which library to perform simplification - Algebrite or math.js.
    // This is not a perfect solution, but is adequate.
    // -------------------------------------------------------------------------
    function formsSimplify(expr) {
        let parse;

        parse = checkMultiplicative(expr);
        isMult = parse[1];

        console.log("AFTER CHECK MULTIPLICATIVE ---------------->" + parse);
        if (isMult) {
            parse = math.parse(parse[0]).toString();
        }
        else {
            parse = parse[0];
        }

        console.log(" THIS IS @ THE END OF FORMS_SIMPLIFY ---------------->" + parse);

        return parse;
    }

    // -------------------------------------------------------------------------
    // Simple function for finding if expression contains parenthesis
    // -------------------------------------------------------------------------
    function hasParens(expr) {
        let stack = [],
            hasParens = false;

        console.log("THIS HERE IS THE EXPR in hasParens:  " + expr);

        for (let i = 0; i < expr.length; ++i) {
            stack.push(expr[i]);

            if (stack[stack.length - 1] === ")") {
                hasParens = true;
            }
        }

        return hasParens;
    }

    function checkOnlyReduced() {
        if (!specialFormsCheck() && !factorCheck() && complexRootCount == 0 &&
            init !== removeWhiteSpace(reduced)) 
        {
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Checks if the polynomial term is a set of multiplicative factors, or an
    // expression that is being added or subtracted.  This is a very complex 
    // function, but it performs the necessary job.
    // -------------------------------------------------------------------------
    function checkMultiplicative(initParse) {
        let expression,
            stack = [],
            globalStack = [],
            globalStackPointer = 0,
            exprQueue = "",
            hasParen = false,
            equalParen = false,
            needsSimplifying = false,
            expr = [],
            parse = "",
            globalParse = "",
            stackParse = "",
            finalParse = "",
            leftParen = 0,
            rightParen = 0,
            tempRight = 0,

            op = /[+-]/;

        expression = removeWhiteSpace(initParse);
        //expression = trimMultSigns(expression);

        for (let i = 0; i < expression.length; ++i) {

            if (leftParen === 0 && rightParen === 0) {
                hasParen = false;
            }

            if (!hasParen) {
                globalStack.push(expression[i]);

                if (globalStack[globalStack.length - 1] === "(") {
                    hasParen = true;
                    globalStack.pop();
                    if (globalStack.length > 0) {
                        globalParse = globalStack.join("");
                        globalParse = globalParse.substring(globalStackPointer, globalStack.length);
                        exprQueue += globalParse;
                        globalStackPointer = globalStack.length;
                    }
                }

                // If the expression contains adding/subtracting of terms
                if ((globalStack.length > 1 && op.test(globalStack[globalStack.length - 1]) &&
                    globalStack[globalStack.length - 2] !== "(") ||
                    (globalStack.length === 1 && op.test(globalStack[0])))
                {
                    globalParse = removeWhiteSpace(combineLikeTerms(expression));
                    globalParse = removeWhiteSpace(Algebrite.simplify(globalParse).toString());
                    return [globalParse, false];
                }
            }

            if (hasParen) {
                stack.push(expression[i]);

                console.log("WELL, here's the stack...  " + stack);
                if (stack[stack.length - 1] === "(") {
                    leftParen += 1;
                }

                if (stack[stack.length - 1] === ")") {
                    rightParen += 1;

                    // peeking ahead for exponents
                    if (expression[i + 1] !== null && expression[i + 2] !== null) {
                        if (expression[i + 1] === "^") {
                            expr.push(expression[i + 2]);
                            expr.push(expression[i + 1]);
                            i += 2;
                        }
                    }

                    expr.push(stack.pop()); // placing ')' onto expr

                    for (let j = stack.length - 1; rightParen > 0; j--) {
                        if (stack[j] === "(") {
                            if (rightParen <= leftParen) {
                                leftParen -= 1;
                            }
                            rightParen -= 1;
                        }
                        else if (stack[j] === ")") {
                            if (rightParen < leftParen) {
                                leftParen += 1;
                            }
                            rightParen += 1;
                        }
                        else if (op.test(stack[j]) && rightParen === 1 && stack[j - 1] !== "(") {
                            needsSimplifying = true;
                        }

                        if (rightParen === leftParen) {
                            equalParen = true;
                        }

                        expr.push(stack.pop());
                    }


                    parse = expr.reverse().join("");

                    console.log("THIS IS --------------> THE EXPRESSION IN MULTIPLICATIVE:  " + parse);
                    console.log("FOLLOWED by:  needsSimplifying:  " + needsSimplifying);
                    console.log("Also THE GLOBAL stack:" + globalStack);
                    console.log("Right paren: " + rightParen + ".. and left paren:  " + leftParen);

                    if (needsSimplifying) {
                        parse = removeWhiteSpace(parse);
                        parse = sanitizeInput(parse);
                        parse = Algebrite.simplify(parse).toString();
                        parse = "(" + parse + ")";
                    }

                    if (equalParen) {
                        exprQueue += parse;
                    }

                    for (let k = 0; k < parse.length; ++k) {
                        stack.push(parse[k]);
                    }

                    needsSimplifying = false; //reset
                    equalParen = false;
                    expr = []; // reset 
                }
            }
        }

        return [exprQueue, true];
    }

    // -------------------------------------------------------------------------
    // Used to locate the recognized forms in a polynomial expression, such as
    // a^2 - b^2, sum/dif of cubes, etc.
    // -------------------------------------------------------------------------
    function depthFirstParse(poly) {
        let totalExpr = reduce(poly, false, 1, true);

        // Need to pull out factors from the special forms
        factorSpecialForms(difSquares);
        factorSpecialForms(sumCubes);
        factorSpecialForms(difCubes);

        console.log("********************************************************");
        console.log("ALL EXPRESSIONS EXTRACTED:  " + totalExpr);
        console.log("***TIME TO SEE HOW WE DID. LET'S SEE THE RESULTS NOW:***");
        console.log("DIF_SQUARES: --->  " + difSquares);
        console.log("SUM_CUBES:   --->  " + sumCubes);
        console.log("DIF_CUBES:   --->  " + difCubes);
        console.log("FACTORS:     --->  " + factors);
        console.log("IRRATIONAL OR COMPLEX: --->  " + irrationalOrComplexTerms);
        console.log("...AND THE COMPLEX COUNT: --->" + complexRootCount);
        console.log("**************AND FOR THE EASE OF DISPLAY***************");
        console.log("DIF_SQUARES TOTAL DISPLAY: --->  " + difSquaresTotal);
        console.log("SUM_CUBES TOTAL DISPLAY:   --->  " + sumCubesTotal);
        console.log("DIF_CUBES TOTAL DISPLAY:   --->  " + difCubesTotal);
        console.log("********************************************************");

        return specialFormsCheck();
    }

    // -------------------------------------------------------------------------
    // Used simply to check if any special forms were parsed
    // -------------------------------------------------------------------------
    function specialFormsCheck() {
        if (difSquares.length > 0 || difCubes.length > 0 || sumCubes.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Used simply to check if any factors were parsed in the expression
    // -------------------------------------------------------------------------
    function factorCheck() {
        if (factors.length > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Used to pull out roots from the special forms that have been found
    // -------------------------------------------------------------------------
    function factorSpecialForms(forms) {
        let matrix, roots, degree;

        forms.forEach(function (form) {
            matrix = toMatrix(prepareForMatrix(form));
            roots = FloPoly.allRoots(matrix);
            degree = FloPoly.degree(matrix);

            if (roots.length > 0) {
                roots.forEach(function (root) {
                    finalRoots.push(root);
                });
            }
            //else {
            //    irrationalOrComplexTerms.push(form);
            //    for (let i = 0; i < degree; ++i) {
            //        complexRootCount += 1;
            //    }
            //}
        });
    }

    // -------------------------------------------------------------------------
    // Returns all the factors discovered in the polynomial
    // -------------------------------------------------------------------------
    function parseFinalFactors() {
        let allFactors = [];

        if (factors.length > 0) {
            factors.forEach(function (term) {
                allFactors.push(term);
            });
        }

        if (difSquares.length > 0) {
            difSquares.forEach(function (term) {
                allFactors.push(term);
            }); 
        }

        if (difCubes.length > 0) {
            difCubes.forEach(function (term) {
                allFactors.push(term);
            });
        }

        if (sumCubes.length > 0) {
            sumCubes.forEach(function (term) {
                allFactors.push(term);
            });
        }

        if (irrationalOrComplexTerms.length > 0) {
            irrationalOrComplexTerms.forEach(function (term) {
                allFactors.push(term);
            });
        }

        return allFactors;
    }

    // -------------------------------------------------------------------------
    // Used to locate the recognized forms in a polynomial expression, such as
    // a^2 - b^2, sum/dif of cubes, etc.  If found, the parsed expressions is
    // added to class instance variables, and the expression is returned as
    // a list - the first position contains the parsed item, and the second 
    // position denotes whether it has been reduced or not.
    // -------------------------------------------------------------------------
    function parseForms(expression) {
        let hasSquares = parseDifSquares(expression),
            hasSumCubes = parseSumCubes(expression),
            hasDifCubes = parseDifCubes(expression),
            foundSpecial = false,
            needsFactoring = false,
            parse,
            matrix,
            degree,
            result;

        if (hasSquares || hasSumCubes || hasDifCubes) {
            foundSpecial = true;
        }

        matrix = toMatrix(prepareForMatrix(expression));
        degree = FloPoly.degree(matrix);
        //needsFactoring = analyzeFactorability(expression, foundSpecial);

        console.log(' THIS IS THE EXPRESSION THAT WAS CHECKED FOR SPECIAL FORMS:  -->' + expression);

        if (foundSpecial || isMult || degree <= 2) {
            parse = Algebrite.factor(expression).toString();
            console.log(' THIS IS AFTER the EXPRESSION HAS BEEN FACTORED --->' + parse);
        }
        else {
            parse = Algebrite.simplify(expression).toString();
        }

        if (hasSquares) {
            difSquaresTotal.push(parse);
            result = grabFactor(parse);
            result.factors.forEach(function (factor) {
                difSquares.push(factor);
            });
            
            console.log("DIF_SQUARES: --->  " + difSquares);
            return { parse: result.parse, isReduced: true, preFactor: result.pre }; // short circuit
        }
        else if (hasSumCubes) {
            sumCubesTotal.push(parse);
            result = grabFactor(parse);
            result.factors.forEach(function (factor) {
                sumCubes.push(factor);
            });
            
            console.log("SUM_CUBES:   --->  " + sumCubes);
            return { parse: result.parse, isReduced: true, preFactor: result.pre }; // short circuit
        }
        else if (hasDifCubes) {
            difCubesTotal.push(parse);
            result = grabFactor(parse);
            result.factors.forEach(function (factor) {
                difCubes.push(factor);
            });
            
            console.log("DIF_CUBES:   --->  " + difCubes);
            return { parse: result.parse, isReduced: true, preFactor: result.pre }; // short circuit
        }

        return { parse: parse, isReduced: false, preFactor: false };
    }

    // -------------------------------------------------------------------------
    // Decides if the expression needs to be factored.  This is mainly based on
    // whether the the expression is a special form or a simple factor.  If the
    // expression is a long, high degree expression, then it should be left to
    // the next stages of the program to analyze.  Otherwise, the steps would 
    // not be shown, and this would defeat the purpose of the program.
    // -------------------------------------------------------------------------
    function analyzeFactorability(expression, foundSpecial) {
        if (foundSpecial) {
            return true;
        }

        let wasExpanded = checkExpansion(expression);

        if (wasExpanded) {
            return true;
        }
        else {
            return false;
        }
    }

    function checkExpansion(expression) {
        let factored = Algebrite.factor(expression),
            expanded;

        factored = removeWhiteSpace(factored);

        let stack = [],
            expr = [],
            hasParens = false;
            parse = "";

        for (let i = 0; i < factored.length; ++i) {
            stack.push(factored[i]);

            if (stack[stack.length - 1] === ")") {
                hasParens = true;

                if (factored[i + 1] !== null && factored[i + 2] !== null &&
                    factored[i + 1] === "^") {
                        expr.push(factored[i + 2]);
                        expr.push(factored[i + 1]);
                        i += 2;
                }

                expr.push(stack.pop()); // placing ')' onto expr

                for (let j = stack.length - 1; stack[j] !== "("; j--) {
                    expr.push(stack.pop());
                }

                expr.push(stack.pop()); //make sure to grab "("
                parse = expr.reverse().join("");

            }
        }

        if (!(hasParens)) {

        }

        expanded = removeWhiteSpace(Algebrite.run(parse).toString());

        if (expression === expanded) {
            return true;
        }
        else {
            return false;
        }
    }

    // N = numRows
    function pascalCoefficient(length) {
        let matrix = [];

        for (let i = 0; i < length; ++i) {
            matrix[i] = new Array(i + 1);

            for (let j = 0; j < i + 1; ++j) {
                if (j === 0 || j === i) {
                    matrix[i][j] = 1;
                } else {
                    matrix[i][j] = matrix[i - 1][j - 1] + matrix[i - 1][j];
                }
            }
        }

        return matrix[length - 1];
    }

    function pascalVariable(length, a, b) {
        let matrix = new Array(length);

        for (let i = 0; i < length; ++i) {
            matrix[i] = Math.pow(a, length - 1 - i) * Math.pow(b, i);
        }

        return matrix;
    }

    function pascalTriangle(coeffMatrix, varMatrix) {
        let pascal = new Array(coeffMatrix.length);

        for (let i = 0; i < coeffMatrix.length; ++i) {
            pascal[i] = coeffMatrix[i] * varMatrix[i];
        }

        return pascal;
    }

    // -------------------------------------------------------------------------
    // Used to locate the recognized form:  *DIFFERENCE OF TWO SQUARES*
    // -------------------------------------------------------------------------
    function parseDifSquares(expression) {
        console.log("IN DIFFERENCE SQUARES:  " + expression);

        let expr = toMatrix(prepareForMatrix(expression)),
            finalPos = expr.length - 1,
            a = expr[0],
            b = expr[finalPos];

        if ((a > 0 && b > 0) || (a < 0 && b < 0)) {
            return false; // cannot go on in this case
        }

        expr = findGCD(expr);

        console.log("DIF SQUARES MATRIX:  " + expr);

        // Probably a better way to do this, but it helps thinking in terms of 
        // what is NOT a dif. of 2 squares.  
        for (let i = 0; i < expr.length; ++i) {
            if (expr.length === 1 || expr.length % 2 === 0) {
                console.log("NOT SQUARE! LENGTH, IN 1");
                break; // Too small, or not of appropriate length
            }
            else if (i === 0 && isNotSquare(expr[i])) {
                console.log("NOT SQUARE! LEADING, IN 2");
                break; // Not a square, leading coefficient
            }
            else if (i === finalPos && isNotSquare(expr[i])) {
                console.log("NOT SQUARE! CONSTANT, IN 3");
                break; // Not a square, constant
            }
            else if (i > 0 && i < finalPos && expr[i] !== 0) {
                console.log("NOT SQUARE! MIDDLE TERMS, IN 4");
                break; // Middle terms should not exist
            }
            else if (i === finalPos) { // final iteration and isSquare
                console.log("MADE IT!!!");
                return true;
            }
            else {
                continue;
            }
        }

        return false; // if make it here, then not isSquare
    }

    // -------------------------------------------------------------------------
    // Used to locate the recognized form:  *DIFFERENCE OF TWO CUBES*
    // -------------------------------------------------------------------------
    function parseDifCubes(expression) {
        console.log("IN DIFFERENCE CUBES:  " + expression);

        let expr = toMatrix(prepareForMatrix(expression));
        isDifCubes = cubeParser(expr, "dif");

        if (isDifCubes) {
            //cubeConverter(expr, expression[1]);
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Used to locate the recognized form:  *SUM OF TWO CUBES*
    // -------------------------------------------------------------------------
    function parseSumCubes(expression) {
        console.log("IN SUM CUBES:  " + expression);

        let expr = toMatrix(prepareForMatrix(expression));
        isSumCubes = cubeParser(expr, "sum");

        if (isSumCubes) {
            //cubeConverter(expr, expression[1]);
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // This function makes sure to parse correctly when factors are involved - 
    // these can be simple factors such as (x + 5) or complex factors such 
    // as (x^2 + 4).  It will save the rational factors, and factor out the
    // complex ones.  It will, however, only grab the rational factors from 
    // either a single degree factor, or a monomial of any degree (x^2, x^3, etc.)
    // In essence, if the user explicitly types in a factor, the program will 
    // notice it and factor it out. NOTE also that it only factors out 
    // irrationals if the expression being checked is of degree 2, i.e. it 
    // contains one pair of irrational conjugates.  If a large expression w/o
    // special forms/factors is parsed, and happens to contain nothing but 
    // complex roots, then this is not discovered at this stage, but later 
    // during synthetic division.
    // -------------------------------------------------------------------------
    function checkForFactors(expression) {
        let expr = removeWhiteSpace(expression);
        console.log("IN FACTOR:  " + expr);

        let matrix = toMatrix(prepareForMatrix(expr)),
            roots = FloPoly.allRoots(matrix),
            degree = FloPoly.degree(matrix),
            isMono = isMonomial(matrix),
            isComplex = hasComplex(roots, degree);

        //let degree = Algebrite.deg(expr);
        if (degree == 0) {
            return { expr: expr, isFactor: true };
        }
        else if (degree == 1) {
            factors.push(expr);
            finalRoots.push(roots[0]);
            return { expr: expr, isFactor: true };
        }
        else if (isMono) {
            factors.push(expr);
            for (let i = 0; i < degree; ++i) {
                finalRoots.push(0);
            }

            return { expr: expr, isFactor: true };
        }
        else if (!(isMono) && isComplex) {
            irrationalOrComplexTerms.push(expr);
            for (let i = 0; i < degree; ++i) {
                complexRootCount += 1;
            }

            return { expr: expr, isFactor: true };
        }
        else {
            return { expr: expr, isFactor: false };
        }
    }

    // -------------------------------------------------------------------------
    // Checks if the expression is a simple monomial
    // -------------------------------------------------------------------------
    function isMonomial(expr) {
        let N = expr.length,
            isMono = true;

        if (N == 1) {
            isMono = false;
        }
        else {
            for (let i = 1; i < N; ++i) {
                if (expr[i] != 0) {
                    isMono = false;
                }
            }
        }

        return isMono;
    }

    // -------------------------------------------------------------------------
    // Checks if the expression contains complex roots such as i or square roots
    // based/irrational roots.  NOTE:  this function can only retrieve a single
    // pair of these complex roots, i.e. the conjugates.  It cannot retrieve all
    // of the complex roots of a term > degree 2 in one fell swoop, as the 
    // FloPoly library is unstable at times when parsing for complex roots 
    // in these cases of degree > 2.
    // -------------------------------------------------------------------------
    function hasComplex(roots, degree) {
        if (degree == 2 && (roots.length == 0 || areIrrational(roots))) {
            return true;
        }
        else {
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Checks if the roots contain irratonal numbers
    // -------------------------------------------------------------------------
    function areIrrational(roots) {
        let isIrrational = false,
            error,
            rounded;

        const pass = 0.000000000001;

        roots.forEach(function (root) {
            if (!Number.isInteger(root) && findPrecision(root) >= 12) {
                rounded = Math.round10(root, -1);
                error = Math.abs(root - rounded); // checking if close to int
                console.log("#####THE ROOT#####" + root);
                console.log("-----ROUNDED------" + rounded);
                console.log("*******ERROR******" + error);
                if (error > pass) {
                    isIrrational = true;
                }
            }
        });

        return isIrrational;
    }

    // -------------------------------------------------------------------------
    // Calculates the precision of a number, if it has a decimal
    // -------------------------------------------------------------------------
    function findPrecision(number) {
        let numString = number.toString();
        return (numString.split('.')[1] || []).length;
    }

    

    //--------------------------------------------------------------------------
    //  Helper function used in parsing either sum or dif of cubes
    //--------------------------------------------------------------------------
    function cubeParser(expr, exprType) {
        let finalPos = expr.length - 1,
            a = expr[0],
            b = expr[finalPos];

        if (exprType === "sum" && ((a > 0 && b < 0) || (a < 0 && b > 0))) {
            return false;  // Cannot go on in this case
        }
        else if (exprType === "dif" && ((a > 0 && b > 0) || (a < 0 && b < 0))) {
            return false; // The same, cannot proceed
        }

        expr = findGCD(expr);

        console.log("MATRIX in CUBE_PARSER:  (AFTER GCD HAS BEEN FOUND!) --->***" + expr);

        // Probably a better way to do this, but it helps thinking in terms of 
        // what is NOT a dif/sum of 2 cubes.  
        for (let i = 0; i < expr.length; ++i) {
            if (expr.length === 1 || finalPos % 3 !== 0) {
                console.log("NOT CUBE! LENGTH, IN 1");
                break; // Too small, or not of appropriate length
            }
            else if (i === 0 && isNotCube(expr[i])) {
                console.log("NOT CUBE, LEADING, IN 2");
                break;
            }
            else if (i === finalPos && isNotCube(expr[i])) {
                console.log("NOT CUBE! CONSTANT, IN 3");
                break;
            }
            else if (i > 0 && i < finalPos && expr[i] !== 0) {
                console.log("NOT CUBE! MIDDLE TERMS, IN 4");
                break; // Middle terms should not exist
            }
            else if (i === finalPos) {
                console.log("MADE IT!!!");
                return true;
            }
            else {
                continue;
            }
        }

        // If made it here, is not a cube
        return false;
    }

    //--------------------------------------------------------------------------
    // Locates the 'leftover' terms; this is the reduced polynomial after all
    // special forms and factors have been parsed
    //--------------------------------------------------------------------------
    function parseReducedTerms() {
        let parse;

        if (allTerms.length > 0) {
            allTerms.forEach(function (term) {
                if (term[1] === false) {
                    reducedTerms.push(term[0]);
                }
            });

            if (reducedTerms.length > 1) {
                for (let i = 0; i < reducedTerms.length; ++i) {
                    reducedTerms[i] = "(" + reducedTerms[i] + ")";
                }

                parse = reducedTerms.join("*");
                parse = Algebrite.run(parse).toString();
                console.log("FINAL REDUCED TERM:  " + parse);
            }
            else if (reducedTerms.length === 1) {
                parse = reducedTerms[0];
            }
            else {
                parse = false; // No reduced terms left, i.e. all factors were
                               // discovered in RecognizableForms
            }
        }

        return parse;
    }

    //--------------------------------------------------------------------------
    // Locates GCD for the terms in the matrix
    //--------------------------------------------------------------------------
    function findGCD(expr) {
        if (expr.length === 1) {
            return false;
        }

        let finalPos = expr.length - 1,
            a = expr[0],
            b = expr[finalPos],
            gcd;

        //Make sure first that it is a candidate for special forms (necessary?)
        for (let i = 0; i < expr.length; ++i) {
            if (i > 0 && i < finalPos && expr[i] !== 0) {
                return false;
            }
        }

        gcd = Algebrite.gcd(a, b);

        if (gcd > 1) {
            if (a < 0) {
                expr[0] = expr[0] / -gcd;
                expr[finalPos] = expr[finalPos] / -gcd;
            }
            else {
                expr[0] = expr[0] / gcd;
                expr[finalPos] = expr[finalPos] / gcd;
            }
        }

        return expr;
    }

    //--------------------------------------------------------------------------
    //  Helper function for locating non-cubes
    //--------------------------------------------------------------------------
    function isNotCube(number) {
        return (number % Math.cbrt(number) !== 0);
    }

    //--------------------------------------------------------------------------
    //  Helper function for locating non-squares
    //--------------------------------------------------------------------------
    function isNotSquare(number) {
        number = Math.abs(number);
        return (number % Math.sqrt(number) !== 0);
    }

    //--------------------------------------------------------------------------
    //  Performs reduction for each expression and sub expression.  The 
    //  reduction process is depth first, and the function itself is recursive.
    //  Basically, each set of terms in the innermost parenthesis is parsed
    //  first.  The parameter 'initial' is a flag to keep up with initial run
    //  of the function.  'isReduced' keeps up with whether the term has been
    //  parsed as a special form factor or just regular factor.  'multiplicity'
    //  tracks the current exponentiation of the term.
    //--------------------------------------------------------------------------
    function reduce(expression, isReduced, multiplicity, initial) {
        console.log("EXPRESSION IN REDUCE:  " + expression);

        let stack = [],
            noParens = true,
            expr = [],
            tempTerms = [],
            stackPointer = 0,
            parse = "",
            stackString = "",
            reduceFactors,
            global,
            exp = /[\^0-9]/,
            exponent = "";

        if (initial) {
            global = initial;
        }
        else {
            global = true;
        }

        expression = removeWhiteSpace(expression);
        expression = trimMultSigns(expression);

        for (let i = 0; i < expression.length; ++i) {
            stack.push(expression[i]);

            if (stack[stack.length - 1] === "(") {
                global = false;
            }

            if (global) {
                stackPointer += 1;
            }

            if (stack[stack.length - 1] === ")") {

                // peeking ahead for exponents
                //if (expression[i + 1] !== null && expression[i + 2] !== null) {
                //    if (expression[i + 1] === "^") {
                        //expr.push(expression[i + 2]);
                        //expr.push(expression[i + 1]);
                        //i += 2;
                        //multiplicity += parseInt(expression[i + 2]);
                        //i += 2;
                //    }
                //}


                expr.push(stack.pop()); // placing ')' onto expr

                for (let j = stack.length - 1; stack[j] !== "("; j--) {
                    expr.push(stack.pop());
                }

                expr.push(stack.pop()); //make sure to grab "("
                parse = expr.reverse().join("");

                try {
                    console.log(" THIS IS THE PARSE:  " + parse);
                    if (parse[parse.length - 3] !== null && parse[parse.length - 2] !== null &&
                        parse[parse.length - 3] === "^") {

                        tempTerms.forEach(function (term) {
                            console.log("THIS IS THE TEMP TERM:  " + term[2]);
                            console.log("THIS IS the EXP being used:  " + parse[parse.length - 2]);
                            term[2] *= parse[parse.length - 2];
                        });
                    }
                    else {
                        math.parse(parse);
                        console.log("****************INSIDE OF TRY-PARSE*************");
                        parse = parseForms(parse);

                        if (isReduced) {
                            tempTerms.push([parse.parse, isReduced, multiplicity, global]);
                        }
                        //else if (parse[2]) {
                        //    tempTerms.push([parse[2], parse[1]]);
                        //    tempTerms.push([parse[0], true]);
                        //}
                        //else if (multiplicity > 0) {
                        //    for (let k = 0; k < multiplicity; ++k) {
                        //        tempTerms.push([parse.parse, parse.isReduced, multiplicity, global]);
                        //    }
                        //}                                                     |
                        else {                                   // CHANGE HERE V //
                            tempTerms.push([parse.parse, parse.isReduced, multiplicity, global]);
                        }
                    }
                }
                catch (error) {
                    console.log(' ERROR PARSING IN PARENS:  =====>  ' + error);
                }
                finally {
                    noParens = false;
                    expr = []; // reset 
                }
            }
        }

        console.log("STACK : " + stack);

        // This branch is either a final node being reduced, or an initial
        // expression that may or may not contain parenthesis.  This section uses
        // numerous if/else statements, but there are many conditions being 
        // checked, so it becomes necessary
        if (noParens) {
            parse = parseForms(expression);

            if (isReduced) {
                allTerms.push([parse.parse, isReduced]);
            }
            else {
                if (hasParens(parse.parse) && !(parse.isReduced)) {
                    console.log("BRANCH:  WHEN 'isReduced' is false and 'hasParens' is TRUE ");
                    reduce(parse.parse, false, multiplicity, initial); // start over if factorable
                }
                else {
                    console.log("BRANCH:  WHEN 'isReduced' and 'hasParens' are false ");
                    reduceFactors = checkForFactors(parse.parse);
                    if (parse.isReduced) {
                        allTerms.push([parse.parse, parse.isReduced]);
                    }
                    else {
                        allTerms.push([parse.parse, reduceFactors.isFactor]);
                    }
                }

            }

            return allTerms;
        }
        // This branch represents what has NOT been popped off the stack, i.e.
        // parts of the expression outside of a parenthesis context
        else {
            if (stack.length > 0) {
                try {
                    stackString = trimMultSigns(stack.join(""));
                    if (stackString) {
                        // Making sure to check for multiplicities
                        if (initial && (stack[stackPointer] !== null && stack[stackPointer + 1] !== null &&
                            stack[stackPointer] === "^")) {
                            console.log("********************INSIDE OF INITIAL PARSING*********");
                            exponent = parseInt(stack[stackPointer + 1]);

                            tempTerms.forEach(function (term) {
                                console.log("THIS IS THE EXP:  " + exponent);
                                console.log(" AND THIS IS THE TERM:  " + term[2]);
                                term[2] *= exponent;
                                term[3] = false;
                            });

                            stackString = stackString.slice(0, -2);
                        }

                        console.log("ATTEMPTING TO PARSE LEFTOVER STACK STRING:  " + stackString);
                        math.parse(stackString);
                        reduceFactors = checkForFactors(stackString);
                        console.log("THIS MEANS THE LEFTOVER STACK STRING WAS PARSED. " +
                            "REDUCE FACTORS - > " + reduceFactors.expr + "and "
                            + reduceFactors.isFactor);
                        tempTerms.push([stackString, reduceFactors.isFactor, multiplicity, initial]);
                    }
                }
                catch (error) {
                    console.log("Unable to parse stack expression: " + error);
                }
            }

            console.log("TEMP TERMS in 'REDUCE':  " + tempTerms);
            tempTerms = renewMultiplicity(tempTerms);
            console.log("RENEWED TEMP TERMS:  " + tempTerms);

            // Each term is recursively reduced.  The second param passed to
            // reduce keeps up with whether it is a special form/factor
            tempTerms.forEach(function (term) {
                reduce(term[0], term[1], term[2], term[3]);
            });
            
            return allTerms;
        }
    }

    // -------------------------------------------------------------------------
    // At the end of reducing a group of factors, this function checks the 
    // multiplicity of each factor.  If the multiplicity is > 1, then it resets
    // the array of factors with the added terms.  For example, if (x+2)^2 is 
    // parsed in the polynomial, then 'x+2' will be recorded with a multiplicity
    // of 2.  Therefore, 2 of these terms will be recognized in terms of finding
    // the finalRoots/factors.  The total multiplicity is accumulated throughout
    // parsing the polynomial terms.
    // -------------------------------------------------------------------------
    function renewMultiplicity(tempTerms) {
        let renew = [],
            fix,
            times,
            multiplicity;

        tempTerms.forEach(function (term) {
            fix = removeWhiteSpace(term[0]);

            console.log("^^^^^^^^^^^^^^ ROLL CALLL^^^^^^^^^^^^^^^^^^");
            console.log("THIS SHOULD BE THE PAREN" + fix[fix.length - 3]);
            console.log("THIS SHOULD BE THE CARET" + fix[fix.length - 2]);
            console.log("THIS SHOULD BE THE EXPONENT" + fix[fix.length - 1]);
            console.log("THIS SHOULD be the REGEX  " + /[0-9]/.test(fix[fix.length - 1]));

            if (fix[fix.length - 3] !== null && fix[fix.length - 2] !== null &&
                fix[fix.length - 1] !== null && fix[fix.length - 3] === ")" &&
                fix[fix.length - 2] === "^" && /[0-9]/.test(fix[fix.length - 1])) {
                times = parseInt(fix[fix.length - 1]);
                fix = fix.slice(0, -2);
            }
            else {
                times = 1;
            }

            multiplicity = term[2] * times;

            for (let i = 0; i < multiplicity; ++i) {
                renew.push([fix, term[1], 1, term[3]]);
            }
        });

        return renew;
    }

    // -------------------------------------------------------------------------
    // Pulls out factors from recognized forms so that it can be distinguished 
    // whether the factor comes from a sp. form or is a genuine factor.
    // -------------------------------------------------------------------------
    function grabFactor(term) {
        let expression = term,
            stack = [],
            expr = [],
            temp = [],
            items = [],
            preFactor = "",
            parse = "";

        expression = removeWhiteSpace(expression);
        expression = trimMultSigns(expression);

        for (let i = 0; i < expression.length; ++i) {
            stack.push(expression[i]);

            if (stack[stack.length - 1] === ")") {

                for (let j = stack.length - 1; stack[j] !== "("; j--) {
                    expr.push(stack.pop());
                }

                stack.pop(); //remove "(" from stack
                expr.splice(0, 1); // remove paren from expr
                parse = expr.reverse().join("");
                temp.push(parse);
                expr = []; // reset 
            }
        }

        console.log("These are the TEMP TERMS IN  'grabFactor':  " + temp);
        console.log("This is the STACK in 'grabFactor':  " + stack);

        for (let i = 0; i < temp.length; ++i) {
            items[i] = temp[i];
            temp[i] = "(" + temp[i] + ")";
        }

        let special = temp.join("");

        if (stack.length > 0) {
            preFactor = stack.join("");
            return { pre: preFactor, factors: items, parse: special };
        }
        else {
            return { pre: false, factors: items, parse: special };
        }
    }
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
            iterateAndDisplay(RZT.getPositiveRoots(), $pq, true);
            setClosingBlockDelimeter($pq);
        }
        else {
            setOpeningBlockDelimeter($pq);
            setOpeningBlockDelimeter($reduced);
            iterateAndDisplay(RZT.getPositiveRoots(), $pq, true);
            iterateAndDisplay(RZT.getReducedPositiveRoots(), $reduced, true);
            setClosingBlockDelimeter($pq);
            setClosingBlockDelimeter($reduced);
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
        iterateAndDisplay(pValues, $("#rzt-p-over-q"), false);
        // Displaying the line in between numerator and denominator
        $("#rzt-p-over-q").append("\\over");
        iterateAndDisplay(qValues, $("#rzt-p-over-q"), false);
        // Final, closing laTex
        $("#rzt-p-over-q").append("}\\]");
    }

    // -----------------------------------------------------------------------------
    // Iterates through each possible root discovered by the RZT and displays it
    // with +- through laTex formatting.
    // -----------------------------------------------------------------------------
    function iterateAndDisplay(roots, $id, notEquation) {
        for (var i = 0; i < roots.length; ++i) {
            if (i === roots.length - 1) {
                if (roots[i] instanceof Fraction) {
                    $id.append("\\pm" + roots[i].toLatex());
                }
                else {
                    $id.append("\\pm" + roots[i]);
                }
            }
            else if (i !== 0 && i % 12 == 0 && notEquation) {
                if (roots[i] instanceof Fraction) {
                    $id.append("\\pm" + roots[i].toLatex() + ", \\\\");
                }
                else {
                    $id.append("\\pm" + roots[i] + ", \\\\");
                }
            }
            else {
                if (roots[i] instanceof Fraction) {
                    $id.append("\\pm" + roots[i].toLatex() + ", ");
                }
                else {
                    $id.append("\\pm" + roots[i] + ", ");
                }
                
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
    polynomial = toMatrix(prepareForMatrix(poly));
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
        let constant = polynomial[polynomial.length - 1],
            multiplesP;

        console.log("CONSTANT: " + constant);
        multiplesP = getMultiples(constant);
        console.log("MULTIPLES of P:  " + multiplesP);
        return multiplesP;
    }

    function initiateQValues() {
        let leading = polynomial[0],
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
        let possibleRoots = new Set(),
            isDuplicate = false;

        if (pValues.length > 0 && qValues.length > 0) {
            pValues.forEach(function (P) {
                qValues.forEach(function (Q) {
                    if ((P / Q) % 1 === 0) {
                        possibleRoots.add(P / Q);
                    }
                    else {
                        // have to check for duplicates w/ fractions.  Apparently
                        // JS Sets do not work with this.
                        possibleRoots.forEach(function (term) {
                            if (term == new Fraction(P, Q)) {
                                isDuplicate = true;
                            }
                        });

                        if (!isDuplicate) {
                            possibleRoots.add(Fraction(P, Q));
                        }

                        isDuplicate = false;
                    }
                });
            });
        }

        let arr = Array.from(possibleRoots);
        arr.sort(sortPos);

        return arr;
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
                    if ((P / Q) % 1 === 0) {
                        possibleRoots.push(P / Q);
                    }
                    else {
                        possibleRoots.push(Fraction(P, Q));
                    }
                });
            });
        }

        possibleRoots.sort(sortPos);

        return possibleRoots;
    }

    // -----------------------------------------------------------------------------
    // This performs P/Q in a polynomial P(x) and returns a REDUCED list of ALL 
    // possible rational roots in P(x).
    // -----------------------------------------------------------------------------
    function allReducedPOverQ() {
        let possiblePosRoots = new Set(),
            possibleNegRoots = new Set(),
            isDuplicate = false;

        if (pValues.length > 0 && qValues.length > 0) {
            pValues.forEach(function (P) {
                qValues.forEach(function (Q) {
                    if ((P / Q) % 1 === 0) {
                        possiblePosRoots.add(P / Q);   // Adds the positive version
                        possibleNegRoots.add(-(P / Q)); // Adds the negative version
                        // Given these numbers are NOT in the set
                    }
                    else {                        // have to check for duplicates w/ fractions.  Apparently
                        // JS Sets do not work with this.
                        possiblePosRoots.forEach(function (term) {
                            if (term == new Fraction(P, Q)) {
                                isDuplicate = true;
                            }
                        });

                        if (!isDuplicate) {
                            possiblePosRoots.add(Fraction(P, Q));
                        }

                        isDuplicate = false;

                        possibleNegRoots.forEach(function (term) {
                            if (term == new Fraction(P, Q)) {
                                isDuplicate = true;
                            }
                        });

                        if (!isDuplicate) {
                            possibleNegRoots.add(Fraction(-P, Q));
                        }

                        isDuplicate = false;
                    }

                });
            });
        }

        let arrPos = Array.from(possiblePosRoots),
            arrNeg = Array.from(possibleNegRoots);

        arrPos.sort(sortPos);
        arrNeg.sort(sortNeg);

        return { pos: arrPos, neg: arrNeg };
    }

    // -----------------------------------------------------------------------------
    // This finds all multiples of a number based on a brute force technique which 
    // traverses all numbers less than the given number.  This technique could be 
    // optimized, but for now, it serves its purpose.
    // -----------------------------------------------------------------------------
    function getMultiples(number) {
        // Handle case of negative numbers. 
        number = math.abs(number);

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
    polynomial =  prepareForMatrix(poly);
    posPolyMatrix = toMatrix(polynomial);
    negPolyMatrix = convertNegFx(toMatrix(polynomial));
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

    // -----------------------------------------------------------------------------
    // A simple function that finds all values less than a given number by 2, while
    // > 0. It returns this list of numbers, which also contains the original number
    // -----------------------------------------------------------------------------
    function convertNegFx(matrix) {
        let N = matrix.length;

        if (N % 2 === 0) {
            for (let i = 0; i < N; i += 2) {
                matrix[i] = -(matrix[i]);
            }
        }
        else {
            for (let i = 1; i < N; i += 2) {
                matrix[i] = -(matrix[i]);
            }
        }

        return matrix;
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
// The parameter 'syn' holds a current reference to the state of the 
// SyntheticDivision object.
// -----------------------------------------------------------------------------
function SyntheticDivisionDisplay(syn, results) {

    //--------------------------------------------------------------------------
    //  Handles most basic displays when the user clicks on a root.  The boolean
    //  param in 'displayHelper' signals whether this is final display or not.
    //--------------------------------------------------------------------------
    this.display = function () {
        displayHelper(syn, results, false, false);
    }

    //--------------------------------------------------------------------------
    //  Handles the display when all roots have been found.  The boolean param 
    //  in 'displayHelper' signals whether this is final display or not.
    //--------------------------------------------------------------------------
    this.finalDisplay = function () {
        displayHelper(syn, results, true, false);
    }

    //--------------------------------------------------------------------------
    //  Handles the display when all roots have been found, but there are still
    //  some irrational roots remaining. 
    //--------------------------------------------------------------------------
    this.alternateDisplay = function () {
        displayHelper(syn, results, false, true);
    }

    //--------------------------------------------------------------------------
    //  Used to mark out roots that have already been guessed 
    //--------------------------------------------------------------------------
    function cancelRoots(guessedIds) {
        guessedIds.forEach(function ($id) {
            if ($id.data("frac")) {
                $id.text("\\(\\cancel{" + $id.data("frac") + "}\\)");
            }
            else {
                $id.text("\\(\\cancel{" + $id.data("root") + "}\\)");
            }
        });
    }

    //--------------------------------------------------------------------------
    //  Used to display the total count for both pos and neg roots.
    //--------------------------------------------------------------------------
    function totalDisplay(posRootCount, negRootCount, $posId, $negId) {
        $posId.text("\\[\\text{Pos. Root Count:  }" + posRootCount + "\\]");
        $negId.text("\\[\\text{Neg. Root Count:  }" + negRootCount + "\\]");
    }

    //--------------------------------------------------------------------------
    //  Aids with display since both 'display' and 'finalDisplay' contain 
    //  similar protocols.
    //--------------------------------------------------------------------------
    function displayHelper(syn, results, isFinal, isAlternate) {
        // Recap section and reinitializing
        totalDisplay(syn.getPosRootCount(), syn.getNegRootCount(),
            $("#syn-total-pos"), $("#syn-total-neg"));
        resetDisplay();

        if (isFinal) {
            // since finished, cancelling all other root choices
            var temp = [];
            temp.push.apply(temp, syn.getRemainingIds());
            temp.push.apply(temp, syn.getGuessedIds());
            cancelRoots(temp);
        }
        else {
            cancelRoots(syn.getGuessedIds());
        }

        // Synthetic division drawing section
        let degree = results.top.length - 1,
            positions = getPositions(degree);

        drawSynthetic(results, positions, degree);

        // Handling conclusion 
        if (results.remainder == 0 && isFinal) {
            $("#syn-summary").removeClass("hidden");
            displayAsBlock(syn.getRationalRoots(), $("#syn-rational-roots"));
        }
        else if (results.remainder == 0) {
            $("#syn-found-root").removeClass("hidden");
        }
        else if (isAlternate) {
            let pos = syn.getPosRootCount()[0],
                neg = syn.getNegRootCount()[0];

            $("#syn-irrational").removeClass("hidden");
            displayCounts(pos, neg);

            if (pos + neg > 2) {
                $("#syn-failure").removeClass("hidden");
                displayAsBlock("\\text{Rational roots discovered:  }" + syn.getRationalRoots(),
                    $("#syn-rational-roots"));
                $(".syn-early-end").addClass("hidden");

            }
            else {
                $(".syn-alt-summary").removeClass("hidden");
                displayAsBlock(syn.getRationalRoots(), $("#syn-rational-roots"));
                displayAsBlock(syn.getIrrationalRoots(), $("#syn-irrational-roots"));
            }
            
        }
        else { // still roots left
            $("#syn-no-root").removeClass("hidden");
        }

        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "syn-total-pos, syn-total-neg," +
            "syn-init-drawing, syn-2nd-drawing, syn-3rd-drawing, syn-final-drawing," +
            "syn-rational-roots, syn-irrational-roots, syn-quadratic"]);
    }

    //--------------------------------------------------------------------------
    //  Determines the positioning that will be displayed in the syn division 
    //  drawing.  This is based on TeX array positioning.
    //--------------------------------------------------------------------------
    function getPositions(N) {
        let position = "";

        while (N >= 0) {
            position += "r";
            N -= 1;
        }

        return position;
    }

    //--------------------------------------------------------------------------
    //  Displays the amount of possible comlex roots left
    //--------------------------------------------------------------------------
    function displayCounts(pos, neg) {
        if (pos > 0 && neg > 0) {
            $("#syn-irr-left").text(pos + " positive and " + neg + " negative ");
        }
        else if (pos > 0) {
            $("#syn-irr-left").text(pos + " positive ");
        }
        else {
            $("#syn-irr-left").text(neg + " negative ");
        }
    }

    //--------------------------------------------------------------------------
    //  Sets up each term for synthetic division display.  Based on TeX.
    //--------------------------------------------------------------------------
    function getTerms(matrix) {
        let line = "";

        for (let i = 0; i < matrix.length; ++i) {
            if (i === matrix.length - 1) {
                line += matrix[i];
            }
            else {
                line += matrix[i] + " & ";
            }
        }

        return line;
    }

    //--------------------------------------------------------------------------
    //  Used to fill the rest of a line with '&' during synthetic division (TeX).
    //--------------------------------------------------------------------------
    function padLine(length) {
        let line = "";

        while (length > 0) {
            line += " & ";
            length -= 1;
        }

        return line;
    }

    //--------------------------------------------------------------------------
    //  Displays the synthetic division diagrams based on how many steps are
    //  required.
    //--------------------------------------------------------------------------
    function drawSynthetic(results, positions, degree) {
        $(".syn-init-erasable").addClass("hidden");

        if (degree === 1) {
            $(".syn-degree1-skippable").addClass("hidden");
            $("#syn-degree1-handler").removeClass("hidden");
            // MAYBE ADD 'HIDDEN' back to these 

            initDrawing(results, positions, $("#syn-init-drawing"));
            step2Drawing(results, positions, $("#syn-2nd-drawing"));
            step3ModifiedDrawing(results, positions, $("#syn-3rd-drawing"));
        }
        else {
            initDrawing(results, positions, $("#syn-init-drawing"));
            step2Drawing(results, positions, $("#syn-2nd-drawing"));
            step3Drawing(results, positions, $("#syn-3rd-drawing"));
            finalDrawing(results, positions, $("#syn-final-drawing"));
        }
    }

    //--------------------------------------------------------------------------
    //  Handles the first synthetic division drawing
    //--------------------------------------------------------------------------
    function initDrawing(results, positions, $initId) {
        console.log("POSITIONS:  " + positions);
        console.log("TERMS:  " + getTerms(results.top));
        let pad = results.top.length - 1,
            r;

        r = checkFraction(results.r);

        $initId.text("\\[\\begin{array} {c|" + positions + "}" 
            + r + "&" + getTerms(results.top) + "\\\\ \
            & \\downarrow" + padLine(pad) + "\\\\ \
            \\hline & \\color{red}{" + results.bottom[0] + "}" + padLine(pad) + " \\end{array}\\]");
    }

    //--------------------------------------------------------------------------
    //  Handles the 2nd synthetic division drawing
    //--------------------------------------------------------------------------
    function step2Drawing(results, positions, $step2Id) {
        let midPad = results.top.length - 2,
            bottomPad = results.top.length - 1,
            r;

        r = checkFraction(results.r);

        $step2Id.text("\\[\\begin{array} {c|" + positions + "}"
            + r + "&" + getTerms(results.top) + "\\\\ \
            & & \\color{red}{" + results.middle[0] + "}" + padLine(midPad) + "\\\\ \
            \\hline & " + results.bottom[0] + padLine(bottomPad) + " \\end{array}\\]");
    }

    //--------------------------------------------------------------------------
    //  Handles the 3rd synthetic division drawing
    //--------------------------------------------------------------------------
    function step3Drawing(results, positions, $step3Id) {
        let pad = results.top.length - 2,
            r;

        r = checkFraction(results.r);

        $step3Id.text("\\[\\begin{array} {c|" + positions + "}"
            + r + "&" + getTerms(results.top) + "\\\\ \
            & & " + results.middle[0] + padLine(pad) + "\\\\ \
            \\hline & " + results.bottom[0] + " & \\color{red}{" + results.bottom[1] + "}" + padLine(pad) + "\\end{array}\\]");
    }

    //--------------------------------------------------------------------------
    //  Handles the 3rd synthetic division drawing, for the modified case of 
    //  a degree 1 polynomial.
    //--------------------------------------------------------------------------
    function step3ModifiedDrawing(results, positions, $step3Id) {
        let r;

        r = checkFraction(results.r);

        $step3Id.text("\\[\\begin{array} {c|" + positions + "}"
            + r + "&" + getTerms(results.top) + "\\\\ \
            & & " + results.middle[0] + "\\\\ \
            \\hline & " + results.bottom[0] + " & \\color{red}{" + results.remainder + "}\\end{array}\\]");
    }

    //--------------------------------------------------------------------------
    //  Handles the final synthetic division drawing
    //--------------------------------------------------------------------------
    function finalDrawing(results, positions, $finalId) {
        let r;

        r = checkFraction(results.r); 

        $finalId.text("\\[\\begin{array} {c|" + positions + "}"
            + r + " & " + getTerms(results.top) + "\\\\ \
            \\ & & " + getTerms(results.middle) + "\\\\ \
            \\hline & " + getTerms(results.bottom) + " & \\color{red}{" + results.remainder + "}\\end{array}\\]");
    }

    //--------------------------------------------------------------------------
    //  Resets the display so that it can be repeated during synthetic division.  
    //--------------------------------------------------------------------------
    function resetDisplay() {
        $("#syn-found-root, #syn-no-root").addClass("hidden");
        $(".syn-draw-content").removeClass("hidden");
    }

    //--------------------------------------------------------------------------
    //  Changes r for latex display if necessary  
    //--------------------------------------------------------------------------
    function checkFraction(r) {
        if (r instanceof Fraction) {
            return r.toLatex();
        }
        else {
            return r;
        }
    }
}

// -------------------------CLASS:  Synthetic Division--------------------------
// -----------------------------------------------------------------------------
// This class will handle the calculations for synthetic division.  Even though
// this is the main purpose, the class will also contain 'onClick' handlers 
// which will be responsible for creating SDDisplay objects.
// -----------------------------------------------------------------------------
function SyntheticDivision(poly, possibleRoots, numberRoots) {
    //  INSTANCE VARIABLES
    let posRootCount = numberRoots.pos,
        negRootCount = numberRoots.neg,
        maxRoots = posRootCount[0] + negRootCount[0],
        posRoots = possibleRoots.pos,
        negRoots = possibleRoots.neg,
        irrationalRoots = [],
        rationalRoots = [],
        factors = [],
        guessedIds = [],
        remainingIds = [],
        idsLeft = 0,
        polynomial = poly,
        _this = this; // keeps a reference to the current object

    // CONSTRUCTOR
    synthReinitializer();
    initialRootsSetup(posRoots, negRoots, "#syn-pos-roots", "#syn-neg-roots");
    initialRecap(posRootCount, negRootCount, $("#syn-total-pos"), $("#syn-total-neg"));
    setAsyncRootHandlers(polynomial);
    // END CONSTRUCTOR

    // ACCESSORS
    this.getPosRootCount = function () {
        return posRootCount;
    }

    this.getNegRootCount = function () {
        return negRootCount;
    }

    this.getMaxRoots = function () {
        return maxRoots;
    }

    this.getPosRoots = function () {
        return posRoots;
    }

    this.getNegRoots = function () {
        return negRoots;
    }

    this.getGuessedIds = function () {
        return guessedIds;
    }

    this.getRemainingIds = function () {
        return remainingIds;
    }

    this.getIrrationalRoots = function () {
        return irrationalRoots;
    }

    this.getRationalRoots = function () {
        return rationalRoots;
    }

    this.getFactors = function () {
        return parseFactors();
    }

    this.getPolynomial = function () {
        return polynomial;
    }
    // END ACCESSORS

    //--------------------------------------------------------------------------
    //  Used to set the initial ID values for the possible roots in the html
    //--------------------------------------------------------------------------
    function initialRootsSetup(posRoots, negRoots, posParentId, negParentId) {
        if (posRoots.length > 0) {
            rootsSetup(posRoots, posParentId, "Pos");
        }

        if (negRoots.length > 0) {
            rootsSetup(negRoots, negParentId, "Neg");
        }
    }

    //--------------------------------------------------------------------------
    //  A simple helper function for initialRootsSetup
    //--------------------------------------------------------------------------
    function rootsSetup(roots, parentId, id) {

        displayInline(id + ":", $(parentId));
        for (let i = 0; i < roots.length; ++i) {
            if (roots[i] instanceof Fraction) {
                $("<span>\\(" + roots[i].toLatex() + "\\)</span>").appendTo(parentId).attr({
                    "id": id + i,
                    "class": "span-space",
                    "data-root": roots[i],
                    "data-frac": roots[i].toLatex() // makes displaying later easier

                });
            }
            else {
                $("<span>\\(" + roots[i] + "\\)</span>").appendTo(parentId).attr({
                    "id": id + i,
                    "class": "span-space",
                    "data-root": roots[i]
                });
            }

            remainingIds.push($("#" + id + i));
            idsLeft += remainingIds.length;
        }
    }

    //--------------------------------------------------------------------------
    //  Shows the initial values discovered from previous stages.  NOTE:  this
    //  method is normally handled during SyntheticDivisionDisplay; however, the
    //  initial iteration must be displayed within this class, as 'this' object 
    //  is not finished constructing if a synchronous call to 
    //  SyntheticDivsionDisplay is made and therefore cannot display its values.
    //--------------------------------------------------------------------------
    function initialRecap(posRootCount, negRootCount, $posId, $negId) {
        $posId.text("\\[\\text{Pos. Root Count:  }" + posRootCount + "\\]");
        $negId.text("\\[\\text{Neg. Root Count:  }" + negRootCount + "\\]");
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "syn-total-pos, syn-total-neg"]);
    }

    //--------------------------------------------------------------------------
    //  Returns the factor version of all roots that have been discovered
    //--------------------------------------------------------------------------
    function parseFactors() {
        let allFactors = [],
            rounded;

        rationalRoots.forEach(function (root) {
            if (root > 0) {
                allFactors.push("(x+" + root + ")");
            }
            else {
                allFactors.push("(x" + root + ")");
            }
            
        });

        if (irrationalRoots.length > 0) {
            irrationalRoots.forEach(function (root) {
                rounded = Math.round10(root, -6);

                if (root > 0) {
                    allFactors.push("(x+" + rounded + ")");
                }
                else {
                    allFactors.push("(x" + rounded + ")");
                }
            })
        }

        return allFactors;
    }

    //--------------------------------------------------------------------------
    //  Sets all of the 'onClick' handlers for each root available.  The handlers
    //  are fired based on which numbers are clicked.
    //--------------------------------------------------------------------------
    function setAsyncRootHandlers(polynomial) {
        remainingIds.forEach(function ($id) {
            let root = $id.data("root"),
                frac = $id.data("frac"),
                rzt,
                reduced,
                bothRoots = [],
                allRoots = [];


            let currentClick = function () {
                return new Promise(function (resolve, reject) {
                    $id.on("click.synth", function () {
                        let results,
                            finished = false;

                        if (frac) {
                            results = synDivide(polynomial, Fraction(root));
                        }
                        else {
                            results = synDivide(polynomial, root);
                        }

                        if (results.foundRoot) {
                            //remainingIds.splice(remainingIds.indexOf($id), 1);

                            if (frac) {
                                rationalRoots.push(frac);
                            }
                            else {
                                rationalRoots.push(results.r);
                            }

                            reduced = toPolynomial(results.bottom);
                            rzt = new RationalZeroTest(reduced);
                            bothRoots = rzt.getAllReducedRoots();

                            if (results.r > 0) {
                                decrementCount(posRootCount);
                            }
                            else {
                                decrementCount(negRootCount);
                            }

                            posRoots = bothRoots.pos;
                            console.log("THESE ARE THE POS ROOTS:  " + posRoots);
                            negRoots = bothRoots.neg;
                            console.log("THESE ARE THE NEG ROOTS" + negRoots);
                            allRoots = posRoots.concat(negRoots);
                            console.log("THESE ARE ALL OF THE ROOTS" + allRoots);
                            modifyIds(allRoots);
                        }
                        else {
                            guessedIds.push($id);
                            remainingIds.splice(remainingIds.indexOf($id), 1);
                            idsLeft -= 1;
                        }

                        if (hasIrrationalRoots()) {
                            let quad = quadraticFormula(results.top);
                            irrationalRoots.push(quad.pos);
                            irrationalRoots.push(quad.neg);

                            new SyntheticDivisionDisplay(_this, results).alternateDisplay();
                            finished = true;
                        }
                        else if (hasFinished()) {
                            new SyntheticDivisionDisplay(_this, results).finalDisplay();
                            finished = true;
                        }
                        else {  
                            new SyntheticDivisionDisplay(_this, results).display();
                        }

                        // Data needed upon completion of click event
                        resolve({
                            synDivResults: results,
                            $id: $id,
                            finished: finished
                        });
                    });
                });
            }; 

            // After the click event has executed
            currentClick().then(function (results) {
                console.log("R:  " + results.synDivResults.r);
                console.log("TOP:  " + results.synDivResults.top);
                console.log("MIDDLE:  " + results.synDivResults.middle);
                console.log("REDUCED:  " + results.synDivResults.bottom);
                console.log("REMAINDER:  " + results.synDivResults.remainder);

                if (results.finished) {
                    $("span").off(".synth"); // remove all click handlers
                    $("#SYNTHETIC-to-FINAL").removeClass("hidden");

                    return; 
                }
                else if (results.synDivResults.foundRoot && !(results.finished)) {  
                    $("span").off(".synth"); // remove all click handlers

                    // Recursively start over with reduced polynomial
                    setAsyncRootHandlers(toPolynomial(results.synDivResults.bottom));
                    
                    return; // Ends remaining loop after recursion finishes  
                }
                else {
                    //Otherwise, only remove a single click event
                    results.$id.off(".synth");
                }
            });
        });
    }

    //--------------------------------------------------------------------------
    //  Lowers the total number of possible roots whenever a root is discovered
    //--------------------------------------------------------------------------
    function decrementCount(rootCount) {
        for (let i = 0; i < rootCount.length; ++i) {
            rootCount[i] -= 1;

            if (rootCount[i] === -1) {
                rootCount.pop();
            }
        }
    }

    //--------------------------------------------------------------------------
    //  Changes the remaining/guessed Id's after a root has been discovered
    //--------------------------------------------------------------------------
    function modifyIds(roots) {
        let stillRoot = false;

        for (let i = 0; i < remainingIds.length; ++i) {
            for (let j = 0; j < roots.length; ++j) {
                console.log("CURRENT ROOT #### " + roots[j]);
                if (roots[j] == remainingIds[i].data("root")) {
                    stillRoot = true;
                }
            }

            if (!stillRoot) {
                guessedIds.push(remainingIds[i]);
                remainingIds.splice(i, 1);
                idsLeft -= 1;
            }

            stillRoot = false;
        }
    }

    //--------------------------------------------------------------------------
    //  Determines if the user has found all the possible rational roots.
    //--------------------------------------------------------------------------
    function hasFinished() {
        if (idsLeft === 0 || rationalRoots.length === maxRoots) {
            return true;
        }
        else {
            return false;
        }
    }

    //--------------------------------------------------------------------------
    // Returns true if all guesses have been exhausted, but the amount of 
    // total roots is higher than the guesses.
    //--------------------------------------------------------------------------
    function hasIrrationalRoots() {
        if (remainingIds.length === 0 && rationalRoots.length < maxRoots) {
            return true;
        }
        else {
            return false;
        }
    }

    //--------------------------------------------------------------------------
    //  Performs synthetic division on the polynomial and returns an object that
    //  contains all of the matrices involved in the steps, as well as the 
    //  remainder.
    //--------------------------------------------------------------------------
    function synDivide(polynomial, root) {
        let top = toMatrix(prepareForMatrix(polynomial)),
            middle = [],
            bottom = [],
            N = top.length - 1,
            foundRoot = false,
            r = root,
            remainder;

        if (r instanceof Fraction) {
            for (let i = 0; i <= N; ++i) {
                if (i === 0) {
                    bottom.push(Fraction(top[i]));
                    middle.push(r.mul(bottom[i]));
                }
                else if (i == N) {
                    bottom.push(middle[i - 1].add(top[i]));
                }
                else {
                    bottom.push(middle[i - 1].add(top[i]));
                    middle.push(r.mul(bottom[i]));
                }
            }
        }
        else {
            for (let i = 0; i <= N; ++i) {
                if (i === 0) {
                    bottom.push(top[i]);
                    middle.push(bottom[i] * r);
                }
                else if (i == N) {
                    bottom.push(top[i] + middle[i - 1]);
                }
                else {
                    bottom.push(top[i] + middle[i - 1]);
                    middle.push(bottom[i] * r);
                }
            }
        }

        // Cleaning up matrices if fractions
        
        if (r instanceof Fraction) {
            for (let i = 0; i < middle.length; ++i) {
                middle[i] = middle[i].toLatex();
            }

            for (let i = 0; i < bottom.length; ++i) {
                bottom[i] = bottom[i].toLatex();
            }
        }

        remainder = bottom.pop();

        if (remainder == 0) { foundRoot = true; }
        

        // Returns all details for display later
        return {
            polynomial: polynomial,
            r : r,
            top: top,
            middle: middle,
            bottom: bottom,
            remainder: remainder,
            foundRoot: foundRoot
        };
    }

    //--------------------------------------------------------------------------
    //  Performs the quadratic formula in the event that all rational roots 
    //  have been exhausted, and it is known that complex roots exist.
    //--------------------------------------------------------------------------
    function quadraticFormula(matrix) {
        let a = matrix[0],
            b = matrix[1],
            c = matrix[2],
            positive,
            negative;

        console.log("##################### A   " + a);
        console.log("##################### B   " + b);
        console.log("##################### C   " + c);

        positive = (-b + Math.sqrt((b * b) - (4 * a * c))) / (2 * a);
        negative = (-b - Math.sqrt((b * b) - (4 * a * c))) / (2 * a);

        return { pos: positive, neg: negative };
    }
    
    //--------------------------------------------------------------------------
    //  Sets up the SYNTHETIC stage so that it can be repeated.  Mainly, this 
    //  function erases the drawings, resets the html, and removes all active
    //  click handlers.
    //--------------------------------------------------------------------------
    function synthReinitializer() {
        $("span").off(".synth"); // removing the click handlers
        $(".syn-draw-content").addClass("hidden");
        $(".syn-reinit").addClass("hidden");
        $("#syn-degree1-handler").addClass("hidden");
        $(".syn-degree1-skippable").removeClass("hidden");
        $(".syn-init-erasable").removeClass("hidden");
        $(".syn-draw-erasable").empty();
    }
}

//##############################################################################
//*******************************END SYNTHETIC STAGE****************************
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
// The user will also be able to navigate to completed stages by clicking the
// the tabs on the left side of the screen.
// -----------------------------------------------------------------------------
var main = function () {
    "use strict";

    // Validates the user input from the form submission
    $("form").on("submit", function () {
        return new InputValidator().validate();
    });

    // Helps cut down on the total amount of HTTP requests.
    if (top.location.pathname === '/Tutorial') {
        let initPolynomial,     // Initial from back end
            polynomial,         // Reduced polynomial for all stages
            curriedRoots,       // From RECOGNIZABLEFORMS
            curriedFactors,     // From RECOGNIZABLEFORMS
            allPossibleRoots,   // For RZT         
            numberOfRoots;      // For DESCARTES

//###################################FORMS######################################

        // Grabbing the data attribute set from the server, which was stored by
        // the Model class.  This is quicker than contacting the server.
        initPolynomial = ($("#initialBackendPolyString").data("poly"));
        let recogForms = new RecognizableForms(initPolynomial),
            stage = new Stage(FORMS);
        new RecognizableFormsDisplay(initPolynomial, recogForms).display();

        polynomial = recogForms.getReduced();

        if (polynomial) {
            curriedRoots = recogForms.getFinalRoots();
            curriedFactors = recogForms.getFinalFactors();
            stage.markStageCompleted(FORMS);
            changeDisplay(stage.getCurrentStage(), FORMS);
            console.log("CURRIED ROOTS:  " + curriedRoots);
            console.log("CURRIED FACTORS:  " + curriedFactors);
        }

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
                var rational = new RationalZeroTest(polynomial);
                new RationalZeroTestDisplay(rational).display();
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
                var descartes = new Descartes(polynomial);
                new DescartesDisplay(descartes).display();
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
                console.log("###ALL POSSIBLE ROOTS AFTER SYNDIV###:  " + allPossibleRoots.pos + "next " + allPossibleRoots.neg);
                console.log("###NUMBER OF ROOTS AFTER SYNDIV###:  " + numberOfRoots.pos + "next " + numberOfRoots.neg);

                let syn = new SyntheticDivision(polynomial, allPossibleRoots, numberOfRoots);
                // NOTE:  Display classes created individually based on user action
                // from within SyntheticDivision class.

                stage.markStageCompleted(SYNTHETIC);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), SYNTHETIC));

                finalClickHandler(polynomial, syn, stage, initPolynomial, curriedRoots, curriedFactors);
            }

        });

        // Redo SYNTHETIC stage if have made it to this stage
        $("#SYNTHETIC-tab").on("click", function () {
            if (stage.isCompleted(FINAL)) {
                //let syn = new SyntheticDivision(polynomial, allPossibleRoots, numberOfRoots);
                stage.setStage(stage.getCurrentStage(),
                    changeDisplay(stage.getCurrentStage(), SYNTHETIC));

                //finalClickHandler(polynomial,
                //    syn, stage, initPolynomial, curriedRoots, curriedFactors);
            }
        });

//################################END_SYNTHETIC#################################

//####################################FINAL#####################################

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
// Handles the transition from SYNTHETIC to FINAL stage.
// -----------------------------------------------------------------------------
function finalClickHandler(polynomial, syn, stage, init, curriedRoots, curriedFactors) {
    console.log("THE CURRIED ROOTS: " + curriedRoots);
    console.log("THE CURRIED FACTORS:  " + curriedFactors);
    // Resets click handler
    $("#SYNTHETIC-to-FINAL").off("click");

    $("#SYNTHETIC-to-FINAL").on("click", function () {
        if (stage.isCompleted(FINAL)) {
            stage.setStage(stage.getCurrentStage(),
                changeDisplay(stage.getCurrentStage(), FINAL));
        }
        else {
            let combinedRoots = curriedRoots.concat(syn.getRationalRoots()),
                combinedFactors = curriedFactors.concat(syn.getFactors()).join("");

            if (syn.getIrrationalRoots().length > 0) {
                for (let i = 0; i < syn.getIrrationalRoots().length; ++i) {
                    combinedRoots.push(Math.round10(syn.getIrrationalRoots()[i], -6));
                }
            }

            displayAsBlock(init, $("#final-poly"));
            displayAsBlock(combinedFactors, $("#final-factors"));
            displayAsBlock(combinedRoots, $("#final-roots"));
            stage.markStageCompleted(FINAL);
            stage.setStage(stage.getCurrentStage(),
                changeDisplay(stage.getCurrentStage(), FINAL));

            MathJax.Hub.Queue(["Typeset", MathJax.Hub,  "final-poly," +
                                                        "final-factors, " +
                                                        "final-roots"]);
        }
    });
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
        if (arrayA[i] != arrayB[i]) return false;
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

    console.log("DEGREE:" + N);

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
// Removes whitespace in input so the Polynomial can be created properly
// -----------------------------------------------------------------------------
function removeWhiteSpace(string) {
    return string.split(" ").join("");
}

// -----------------------------------------------------------------------------
// Removes the '*' signs in polynomials, only after the polynomial has been
// parsed and simplified.  This is solely for pretty printing to the user.
// -----------------------------------------------------------------------------
function removeMultSigns(string) {
    return string.split("*").join("");
}

function trimMultSigns(string) {
    string = removeWhiteSpace(string);

    if (string[string.length - 1] === "*") {
        string = string.slice(0, -1);
    }

    if (string[0] === "*") {
        string = string.slice(1);
    }

    return string;
}

// -----------------------------------------------------------------------------
// Places a '*' sign into a polynomial if, after it has been parsed and 
// simplified, it still contains values that are adjacent to each other such
// as 7x(x + 5).  CAS cannot seem to do this properly, so this will have to 
// be implemented to make sure the VALUES are correct if a user decides to input
// a certain way.  * It also removes redundant signs, such as '8 + -5' since 
// these CAS often cannot handle this as well.  It's ridiculous that this has to
// be done, but whatever.
// -----------------------------------------------------------------------------
function sanitizeInput(string) {
    string = removeWhiteSpace(string);

    let stack = "",
        x = /[xX]/,
        num = /[0-9]/,
        plus = /[+]/,
        minus = /[-]/,
        leftParen = /\(/,
        rightParen = /\)/,
        char = "",
        next = "";

    for (let i = 0; i < string.length - 1; ++i) {
        char = string[i];
        next = string[i + 1];

        stack += char;

        if (x.test(char)) {
            if (num.test(next) || leftParen.test(next)) {
                stack += "*";
            }
        }
        else if (num.test(char)) {
            if (x.test(next) || leftParen.test(next)) {
                stack += "*";
            }
        }
        else if (rightParen.test(char)) {
            if (x.test(next) || num.test(next) || leftParen.test(next)) {
                stack += "*";
            }
        }
        else if (plus.test(char)) {
            if (minus.test(next)) {
                stack = stack.slice(0, -1); // cuts off last char
            }
        }
    }

    // Making sure to add final character
    stack += string[string.length - 1];

    return stack;
}

// -----------------------------------------------------------------------------
// This function performs all of the necessary task before a polynomial is 
// converted to a matrix.
// -----------------------------------------------------------------------------
function prepareForMatrix(poly) {
    try {
        let parse = math.parse(poly).toString();
        //console.log("PARSE:  " + parse);
        let expanded = combineLikeTerms(parse);

        return expanded;
    }
    catch (error) {
        console.log("*ERROR* - cannot parse for matrix:  " + error);
    }

}

// Takes a string form of polynomial and expands it
function combineLikeTerms(poly) {
    let parse = removeWhiteSpace(poly),
        corrected = sanitizeInput(parse);
    console.log("CORRECTED IN PREP: " + corrected);

    let expanded = Algebrite.run(corrected).toString();
    console.log("EXPANDED IN PREP: " + expanded);

    return expanded;
}

// -----------------------------------------------------------------------------
// This method is borrowed from MDN in order to allow decimal rounding
// -----------------------------------------------------------------------------
(function () {
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // If the value is negative...
        if (value < 0) {
            return -decimalAdjust(type, -value, exp);
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

function sortPos(a, b) {
    return (a - b);
}

function sortNeg(a, b) {
    return (b - a);
}

//##############################################################################
//**************************END MISCELLANEOUS FUNCTIONS*************************
//##############################################################################
$(document).ready(main);