describe("Stage - CLASS TEST", function () {
    let stage, initialStage, currentStage, previousStage, completed;

    beforeEach(function () {
        stage = new Stage(FORMS);

        spyOn(stage, 'getCurrentStage').and.callThrough();
        spyOn(stage, 'getPreviousStage').and.callThrough();
        spyOn(stage, 'markStageCompleted').and.callThrough();
        spyOn(stage, 'isCompleted').and.callThrough();
        spyOn(stage, 'setStage').and.callThrough();

        initialStage = stage.getCurrentStage();

        stage.setStage(FORMS, RZT);
        stage.markStageCompleted(FORMS);

        completed = stage.isCompleted(FORMS);
        currentStage = stage.getCurrentStage();
        previousStage = stage.getPreviousStage();
    });

    it("should create a Stage object", function () {
        expect(stage).toBeDefined();
    });

    it("should initialize to constructor's stage", function () {
        expect(initialStage).toBe(FORMS);
    });

    it("should be able to return current stage", function () {
        expect(stage.getCurrentStage).toHaveBeenCalled();
        expect(stage.getCurrentStage()).toBe(RZT);
    });

    it("should be able to return previous stage", function () {
        expect(stage.getPreviousStage).toHaveBeenCalled();
        expect(stage.getPreviousStage()).toBe(FORMS);
    });

    it("should be able to set a current/previous", function () {
        expect(stage.setStage).toHaveBeenCalledWith(FORMS, RZT);
        expect(previousStage).toBe(FORMS);
        expect(currentStage).toBe(RZT);
    });

    it("should be able to mark a stage as completed", function () {
        expect(stage.markStageCompleted).toHaveBeenCalledWith(FORMS);
    });

    it("should be able to check if a stage is completed", function () {
        expect(stage.isCompleted).toHaveBeenCalledWith(FORMS);
        expect(completed).toBe(true);
    });
});

describe("InputValidator - CLASS TEST", function () {
    let validator, input;

    $('body').append('<input name="polyString" id="polyInput" type="text" ' +
        'placeholder= "Enter polynomial here" value=""><p id="polyInputError"></p>');

    validator = new InputValidator();

    beforeEach(function () {
        spyOn(validator, 'validate').and.callThrough();
    });

    it("should create an InputValidator object", function () {
        expect(validator).toBeDefined();
    });

    it("should expect the values to be polynomials - single variable and parsable", function () {
        let test1, test2, test3, test4;

        $("#polyInput").val("x^2+5x+4");
        test1 = validator.validate();

        $("#polyInput").val("(x^2-4)(x+6)");
        test2 = validator.validate();

        $("#polyInput").val("x^2+4y-8");
        test3 = validator.validate();

        $("#polyInput").val("Gerbils");
        test4 = validator.validate();

        expect(test1).toBe(true);
        expect(test2).toBe(true);
        expect(test3).toBe(false);
        expect(test4).toBe(false);
    });

    it("should catch incorrect user input and display error", function () {
        $("#polyInput").val("INCORRECT");

        input = validator.validate();

        expect(input).toBe(false);
        expect($("#polyInputError")).toHaveText("*Please enter a valid polynomial expression");
    });

    it("should check if roots exist and display error", function () {
        $("#polyInput").val("8");

        input = validator.validate();

        expect(input).toBe(false);
        expect($("#polyInputError")).toHaveText("*No rational roots exist.  Please try again.");
    });

});

describe("RationalZeroTest - CLASS TEST", function () {
    let polynomial = "2x^2+13x+6",
        pValues,
        qValues,
        positiveRoots,
        reducedPositiveRoots,
        allReducedRoots,
        rzt = new RationalZeroTest(polynomial);

    beforeEach(function () {
        spyOn(rzt, "getPValues").and.callThrough();
        spyOn(rzt, "getQValues").and.callThrough();
        spyOn(rzt, "getPositiveRoots").and.callThrough();
        spyOn(rzt, "getReducedPositiveRoots").and.callThrough();
        spyOn(rzt, "getAllReducedRoots").and.callThrough();

        pValues = rzt.getPValues();
        qValues = rzt.getQValues();
        positiveRoots = rzt.getPositiveRoots();
        reducedPositiveRoots = rzt.getReducedPositiveRoots();
        allReducedRoots = rzt.getAllReducedRoots();
    });

    it("should create a RationalZeroTest object", function () {
        expect(rzt).toBeDefined();
    });

    it("should find the p values of the polynomial", function () {
        expect(rzt.getPValues).toHaveBeenCalled();
        expect(pValues).toEqual([1, 2, 3, 6]);
    });

    it("should find the q values of the polynomial", function () {
        expect(rzt.getQValues).toHaveBeenCalled();
        expect(qValues).toEqual([1, 2]);
    });

    it("should make the positive possible roots available - for later display", function () {
        expect(rzt.getPositiveRoots).toHaveBeenCalled();
        expect(positiveRoots).toEqual([.5, 1, 1, 1.5, 2, 3, 3, 6]);
    });

    it("should reduce the possible positive roots - for later display", function () {
        expect(rzt.getReducedPositiveRoots).toHaveBeenCalled();
        expect(reducedPositiveRoots).toEqual([.5, 1, 1.5, 2, 3, 6]);
    });

    it("should reduce ALL possible roots - for later display", function () {
        expect(rzt.getAllReducedRoots).toHaveBeenCalled();
        expect(allReducedRoots).toEqual({
            pos: [.5, 1, 1.5, 2, 3, 6],
            neg: [-.5, -1, -1.5, -2, -3, -6]
        });
    });
});

describe("RationalZeroTestDisplay - CLASS TEST", function () {
    $("body").append("<p id='rzt-p-over-q'></p>" +
        "<p id='rzt-pq'></p>" +
        "<p id='rzt-pq-reduced'></p>");

    let $pOverQ = $("#rzt-p-over-q"),
        $pq = $("#rzt-pq"),
        $reduced = $("#rzt-pq-reduced"),
        rzt = new RationalZeroTest("x^2+3x+2"),
        display = new RationalZeroTestDisplay(rzt).display();

    it("should display the p's and q's as numbers over an equation.", function () {
        expect($pOverQ).toHaveText("\\[ {p\\over q} = {\\pm1, \\pm2\\over\\pm1}\\]");
    });

    it("should display all possible p/q values", function () {
        expect($pq).toHaveText("\\[\\pm1, \\pm2\\]");
    });

    it("should display all reduced p/q values", function () {
        expect($reduced).toHaveText(""); // since the same in this case
    });

});

describe("Descartes - CLASS TEST", function () {
    let polynomial = "x^2+5x-6",
        testPoly,
        negPolynomial,
        posSignChanges,
        negSignChanges,
        possiblePositives,
        possibleNegatives,
        allValues,
        descartes = new Descartes(polynomial);


    beforeEach(function () {
        spyOn(descartes, "getPolynomial").and.callThrough();
        spyOn(descartes, "getNegPolynomial").and.callThrough();
        spyOn(descartes, "getPosSignChanges").and.callThrough();
        spyOn(descartes, "getNegSignChanges").and.callThrough();
        spyOn(descartes, "getPossiblePositives").and.callThrough();
        spyOn(descartes, "getPossibleNegatives").and.callThrough();
        spyOn(descartes, "getDescartes").and.callThrough();

        testPoly = descartes.getPolynomial();
        negPolynomial = descartes.getNegPolynomial();
        posSignChanges = descartes.getPosSignChanges();
        negSignChanges = descartes.getNegSignChanges();
        possiblePositives = descartes.getPossiblePositives();
        possibleNegatives = descartes.getPossibleNegatives();
        allValues = descartes.getDescartes();
    });

    it("should create a Descartes object", function () {
        expect(descartes).toBeDefined();
    });

    it("should return the normal polynomial string", function () {
        expect(descartes.getPolynomial).toHaveBeenCalled();
        testPoly = removeWhiteSpace(testPoly);
        expect(testPoly).toBe("x^2+5x-6");
    });

    it("should return the f(-x) polynomial", function () {
        expect(descartes.getNegPolynomial).toHaveBeenCalled();
        expect(negPolynomial).toBe("x^2-5x-6");
    });

    it("should determine the number of positive sign changes", function () {
        expect(descartes.getPosSignChanges).toHaveBeenCalled();
        expect(posSignChanges).toEqual(1);
    });

    it("should determine the number of negative sign changes", function () {
        expect(descartes.getNegSignChanges).toHaveBeenCalled();
        expect(negSignChanges).toEqual(1);
    });

    it("should determine all possible amounts of positive roots", function () {
        expect(descartes.getPossiblePositives).toHaveBeenCalled();
        expect(possiblePositives).toEqual([1]);
    });

    it("should determine all possible amounts of negative roots", function () {
        expect(descartes.getPossibleNegatives).toHaveBeenCalled();
        expect(possibleNegatives).toEqual([1]);
    });

    it("should determine all amounts for both pos. and neg - Descartes' Rule", function () {
        expect(descartes.getDescartes).toHaveBeenCalled();
        expect(allValues).toEqual({ pos: [1], neg: [1] });
    });
});

describe("DescartesDisplay - CLASS TEST", function () {
    setFixtures('<p id="descartes-poly-positive"></p>' +
        '<p id="positive-sign-changes"></p>' +
        '<p id="no-positive"></p>' +
        '<p id="possible-positive-roots"></p>' +
        '<p id="descartes-poly-negative"></p>' +
        '<p id="negative-sign-changes"></p>' +
        '<p id="no-negative"></p>' +
        '<p id="possible-negative-roots"></p>');

    let $posPoly = $("#descartes-poly-positive"),
        $posSign = $("#positive-sign-changes"),
        $noPos = $("#no-positive"),
        $posPositives = $("#possible-positive-roots"),
        $negPoly = $("#descartes-poly-negative"),
        $negSign = $("#negative-sign-changes"),
        $noNeg = $("#no-negative"),
        $posNegatives = $("#possible-negative-roots");

    let descartes = new Descartes("2x^3-x^2-3x+2"),
        display = new DescartesDisplay(descartes).display();

    it("should display the polynomial as f(x)", function () {
        expect($posPoly).toHaveText("\\[{2 x^3 - x^2 - 3 x + 2}\\]");
    });

    it("should display the number of positive sign changes", function () {
        expect($posSign).toHaveText("\\(2\\)");
    });

    it("should notice if no positive or negative sign changes occur", function () {
        expect($noPos).toHaveText(""); // Empty since pos. sign changes 
        expect($noPos).toHaveText(""); // Empty since neg. sign changes
    });

    it("should display all of amounts for possible positives", function () {
        expect($posPositives).toHaveText("\\[\\text{Positive Roots:  }2,0\\]");
    });

    it("should display the polynomial as f(x)", function () {
        expect($negPoly).toHaveText("\\[{-2x^3-x^2+3x+2}\\]");
    });

    it("should display the number of negative sign changes", function () {
        expect($negSign).toHaveText("\\(1\\)");
    });

    it("should display all of amounts for possible negatives", function () {
        expect($posNegatives).toHaveText("\\[\\text{Negative Roots:  }1\\]");
    });

});

describe("SyntheticDivision - CLASS TEST", function () {
    //FINISH
});

describe("SyntheticDivisionDisplay - CLASS TEST", function () {
    //FINISH
});

describe("removeWhiteSpace TEST function", function () {
    it("should remove the whitespace from input", function () {
        let string = "x^2 + 5x      - 4",
            test;

        test = removeWhiteSpace(string);

        expect(test).toEqual("x^2+5x-4");
    });
});

describe("removeMultSigns TEST function", function () {
    it("should remove '*' signs from input when necessary", function () {
        let string = "x^2 + 5*x",
            test;

        test = removeMultSigns(string);

        expect(test).toEqual("x^2 + 5x");
    });
});

describe("prepareForMatrix TEST function", function () {
    it("should change input to an expanded form", function () {
        let string = "(x^2 + 4)(x - 7)",
            test;

        test = prepareForMatrix(string);

        let condensed = removeWhiteSpace(test);
        
        expect(condensed).toEqual("x^3-7x^2+4x-28");
    });
});

describe("sanitizeInput TEST function", function () {
    it("should add '*' for CAS parsing", function () {
        let string = "(x - 2)^2 + 7x(x^2)",
            test;

        test = sanitizeInput(string);

        expect(test).toEqual("(x-2)^2+7*x*(x^2)");
    });

    it("should removed redundant signs, mainlyg '+-<number>'", function () {
        let string = "(x - 2)^2 +- 8",
            test;

        test = sanitizeInput(string);

        expect(test).toEqual("(x-2)^2-8");
    });
});

describe("toPolynomial TEST function", function () {
    it("should change an array/matrix into a polynomial string", function () {
        let matrix = [1, 1, -3],
            test;

        test = toPolynomial(matrix);

        expect(test).toEqual("x^2+x-3");
    });
});

describe("toMatrix TEST function", function () {
    it("should change a polynomial into a matrix/array", function () {
        let polynomial = "x^4+3x^3-x+22", 
            test;

        test = toMatrix(polynomial);

        expect(test).toEqual([1, 3, 0, -1, 22]);
    });
});

describe("arraysAreEqual TEST function", function () {
    it("should compare two arrays for COMPLETE equality", function () {
        let array1 = ["bob", "larry"],
            array2 = ["larry", "bob"],
            array3 = [1, 2, 3, 4],
            array4 = [1, 2, 3, 4],
            array5 = [1, 2, 3],
            array6 = [4, 3, 2, 1],
            test;

        test1 = arraysAreEqual(array1, array2);
        test2 = arraysAreEqual(array3, array4);
        test3 = arraysAreEqual(array4, array5);
        test4 = arraysAreEqual(array4, array6);

        expect(test1).toBe(true);
        expect(test2).toBe(true);
        expect(test3).toBe(false);
        expect(test4).toBe(true);
    });
});

describe("selectStageHeading TEST function", function () {
    it("should return the name of the stage for header display ", function () {
        let stage0 = FORMS,
            stage1 = RZT,
            stage2 = DESCARTES,
            stage3 = SYNTHETIC,
            stage4 = FINAL;

        let test0 = selectStageHeading(stage0),
            test1 = selectStageHeading(stage1),
            test2 = selectStageHeading(stage2),
            test3 = selectStageHeading(stage3),
            test4 = selectStageHeading(stage4);

        expect(test0).toEqual("Recognizable Forms");
        expect(test1).toEqual("Rational Zero Test");
        expect(test2).toEqual("Descartes' Rule of Signs");
        expect(test3).toEqual("Synthetic Division");
        expect(test4).toEqual("Final");
    });
});

describe("changeHeading TEST function", function () {
    it("should change h3 header's name in the DOM", function () {
        $("body").append("<h3></h3>");
        changeHeading(FINAL);
        expect($("h3")).toContainText("Final");

        changeHeading(FORMS);
        expect($("h3")).toContainText("Forms");
    });
});

describe("changeActiveSection TEST function", function () {
    it("should change the tab on the list-group in the DOM", function () {
        setFixtures('<div class="list-group">' +
            '<p id="FORMS-tab" class="list-group-item active">' +
            'Recognizable Forms' +
            '</p>' +
            '<p id="RZT-tab" class="list-group-item">Rational Zero Test</p>' +
            '<p id="DESCARTES-tab" class="list-group-item">Descartes Rule</p>' +
            '<p id="SYNTHETIC-tab" class="list-group-item">Synthetic Division</p>' +
            '<p id="FINAL-tab" class="list-group-item">Final</p>' +
            '</div>');

        expect($('#FORMS-tab')).toHaveClass("active");

        changeActiveSection(FORMS, RZT);
        expect($("#RZT-tab")).toHaveClass("active");
        expect($('#FORMS-tab')).not.toHaveClass("active");

        changeActiveSection(RZT, FINAL);
        expect($("#FINAL-tab")).toHaveClass("active");
        expect($("#RZT-tab")).not.toHaveClass("active");
    });
});

describe("displayStageContent TEST function", function () {
    it("should render sections of the DOM visible", function () {
        setFixtures('<div class="recognizable-forms-content">VISIBLE</div>' +
            '<div class="rational-zero-content hidden">HIDDEN</div>' +
            '<div class="descartes-content hidden">HIDDEN</div>' +
            '<div class="synthetic-content hidden">HIDDEN</div>' +
            '<div class="final-content hidden">HIDDEN</div>'
        );

        expect($('.recognizable-forms-content')).not.toHaveClass('hidden');
        expect($('.rational-zero-content')).toHaveClass('hidden');

        displayStageContent(FORMS, RZT);

        expect($('.recognizable-forms-content')).toHaveClass('hidden');
        expect($('.rational-zero-content')).not.toHaveClass('hidden');
    });
});

describe("setClosingInlineDelimeter TEST function", function () {
    it("should place an inline delimeter at the end of html text", function () {
        // FINISH
    });
});

describe("setOpeningInlineDelimeter TEST function", function () {
    it("should place an inline delimeter at the beginning of html text", function () {
        // FINISH
    });
});

describe("setClosingBlockDelimeter TEST function", function () {
    it("should place a block delimeter at the end of html text", function () {
        // FINISH
    });
});

describe("setOpeningBlockDelimeter TEST function", function () {
    it("should place a block delimeter at the beginning of html text", function () {
        // FINISH
    });
});

describe("displayInline TEST function", function () {
    it("should place inline delimiter tags around LaTeX math elements", function () {
        // FINISH
    });
});

describe("displayAsBlock - FUNCTION TEST", function () {
    it("should place block delimiter tags around LaTex math elements", function () {
        // FINISH
    });
});