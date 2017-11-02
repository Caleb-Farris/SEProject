describe("removeWhiteSpace", function () {
    it("should remove the whitespace from input", function () {
        let string = "x^2 + 5x      - 4",
            test;

        test = removeWhiteSpace(string);

        expect(test).toEqual("x^2+5x-4");
    });
});

describe("removeMultSigns", function () {
    it("should remove '*' signs from input when necessary", function () {
        let string = "x^2 + 5*x",
            test;

        test = removeMultSigns(string);

        expect(test).toEqual("x^2 + 5x");
    });
});

describe("prepareForMatrix", function () {
    it("should change input to an expanded form", function () {
        let string = "(x^2 + 4)(x - 7)",
            test;

        test = prepareForMatrix(string);

        let condensed = removeWhiteSpace(test);
        
        expect(condensed).toEqual("x^3-7x^2+4x-28");
    });
});

describe("sanitizeInput", function () {
    it("should add '*' for CAS parsing", function () {
        let string = "(x - 2)^2 + 7x(x^2)",
            test;

        test = sanitizeInput(string);

        expect(test).toEqual("(x - 2)^2 + 7*x*(x^2)");
    });

    it("should removed redundant signs, mainlyg '+-<number>'", function () {
        let string = "(x - 2)^2 +- 8",
            test;

        test = sanitizeInput(string);

        expect(test).toEqual("(x - 2)^2 - 8");
    });
});

describe("toPolynomial", function () {
    it("should change an array/matrix into a polynomial string", function () {
        let matrix = [1, 1, -3],
            test;

        test = toPolynomial(matrix);

        expect(test).toEqual("x^2+x-3");
    });
});

describe("toMatrix", function () {
    it("should change a polynomial into a matrix/array", function () {
        let polynomial = "x^4+3x^3-x+22", 
            test;

        test = toMatrix(polynomial);

        expect(test).toEqual([1, 3, 0, -1, 22]);
    });
});

describe("arraysAreEqual", function () {
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

describe("selectStageHeading", function () {
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

describe("changeHeading", function () {
    it("should change h3 header's name in the DOM", function () {
        $("body").append("<h3></h3>");
        changeHeading(FINAL);
        expect($("h3")).toContainText("Final");

        changeHeading(FORMS);
        expect($("h3")).toContainText("Forms");
    });
});

describe("changeActiveSection", function () {
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

describe("displayStageContent", function () {
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