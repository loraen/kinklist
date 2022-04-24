_exporterCanvasMethods = {
    initCanvas: function initCanvas(width, height){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;

        this.$canvas = $(this.canvas);
        this.$canvas.css({
            width: width,
            height: height
        });

        this.context = this.canvas.getContext('2d');
        this.context.fillStyle = '#FFFFFF';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.font = "bold 24px Arial";
        this.context.fillStyle = '#000000';
        this.context.fillText('Kinklist 2.0 ' + this.username, 5, 25);
    },

    renderCanvas: function renderCanvas(){
        this.context.font = "bold 13px Arial";
        this.context.fillStyle = '#000000';

        const ENTRY_LENGTH = 180;
        const ENTRY_SPACING = 15

        var levelKeys = Object.keys(this.colors);
        var x = this.context.canvas.width - ENTRY_SPACING - (ENTRY_LENGTH * levelKeys.length);
        for(var i = 0; i < levelKeys.length; i++) {
            var levelKey = levelKeys[i];
            var levelValue = this.colors[levelKey];

            this.context.beginPath();
            this.context.arc(x + (ENTRY_LENGTH * i), 17, 8, 0, 2 * Math.PI, false);
            this.context.fillStyle = levelValue;
            this.context.fill();
            this.context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            this.context.lineWidth = 1;
            this.context.stroke();

            this.context.fillStyle = '#000000';
            this.context.fillText(levelKey, x + ENTRY_SPACING + (i * ENTRY_LENGTH), 22);
        }

        // Now render the individual columns
        for(var i = 0; i < this.columns.length; i++){
            var column = this.columns[i];
            var drawStack = column.drawStack;

            var drawX = offsets.left + (columnWidth * i);
            for(var j = 0; j < drawStack.length; j++){
                var drawCall = drawStack[j];
                drawCall.x = drawX;
                drawCall.y += offsets.top;
                this[drawCall.type](this.context, drawCall);
            }
        }
    },

    renderSimpleTitle: function(context, drawCall){
        context.fillStyle = '#000000';
        context.font = "bold 18px Arial";
        context.fillText(drawCall.data, drawCall.x, drawCall.y + 5);
    },
    renderTitleSubtitle: function(context, drawCall){
        context.fillStyle = '#000000';
        context.font = "bold 18px Arial";
        context.fillText(drawCall.data.category, drawCall.x, drawCall.y + 5);

        var fieldsStr = drawCall.data.fields.join(', ');
        context.font = "italic 12px Arial";
        context.fillText(fieldsStr, drawCall.x, drawCall.y + 20);
    },
    renderKinkRow: function(context, drawCall){
        context.fillStyle = '#000000';
        context.font = "12px Arial";

        var x = drawCall.x + 5 + (drawCall.data.choices.length * 20);
        var y = drawCall.y - 6;
        context.fillText(drawCall.data.text, x, y);

        // Circles
        for(var i = 0; i < drawCall.data.choices.length; i++){
            var choice = drawCall.data.choices[i];
            console.log(choice)

            var color = (
                (choice == 'remove')
                ? '#EEEEEE99'
                : this.colors[choice]
            );

            var x = 10 + drawCall.x + (i * 20);
            var y = drawCall.y - 10;

            context.beginPath();
            context.arc(x, y, 8, 0, 2 * Math.PI, false);
            context.fillStyle = color;
            context.fill();
            context.strokeStyle = 'rgba(0, 0, 0, 0.5)'
            context.lineWidth = 1;
            context.stroke();
        }
    },
};


function ExporterCanvas(width, height, username, colors, columns) {
    let self = Object.create(_exporterCanvasMethods);

    self.username = username;
    self.colors = colors;
    self.columns = columns;

    self.initCanvas(width, height);
    self.renderCanvas(this.context);

    return self;
};







function dumpKinkSelection(levels) {
    var kinksInfo = {
        categories: [],
        longestKinkName: 0,
        longestCatName: 0,
        longestCategoryChoices: 0,

        totalKinks: 0,

        totalHeight: 0,
    };

    $('.kinkCategory').each(function() {
        var $cat = $(this);
        var catName = $cat.data('category');
        var categoryData = kinks[catName];

        var kinkCategory = {
            name: catName,
            fields: categoryData.fields,
            fieldsLength: NaN,

            kinks: [],
        };

        kinkCategory.fieldsLength = kinkCategory.fields.reduce(
            (prev, field) => field.length + prev,
            0
        );
        kinksInfo.longestCategoryChoices = Math.max(
            kinksInfo.longestCategoryChoices,
             kinkCategory.fieldsLength
        );
        kinksInfo.longestCatName = Math.max(
            kinksInfo.longestCatName,
            kinkCategory.name,
        );

        // Now see which ones are actually selected
        $cat.find('.kinkRow').each(function(index){
            var $kinkRow = $(this);
            var kinkInfo = categoryData.kinks[index];

            var kink = {
                choices: [],
                name: kinkInfo.kinkName,
                desc: kinkInfo.kinkDesc,
            };

            $kinkRow.find('.choices').each(function(){
                var $selection = $(this).find('.choice.selected');

                var level = (($selection.length > 0)
                    ? levels[$selection.data('level')]
                    : 'remove'
                );
                kink.choices.push(level);
            });

            var choicesSelected = kink.choices.reduce(
                (prev, cur) => prev + (cur == 'remove' ? 0 : 1),
                0
            );
            if (choicesSelected == 0) {
                return;
            }

            kinksInfo.longestKinkName = Math.max(
                kinksInfo.longestKinkName,
                kink.name.length
            );
            kinkCategory.kinks.push(kink);
            kinksInfo.totalKinks += 1;
        });

        if (kinkCategory.kinks.length == 0) {
            return;
        }

        kinksInfo.categories.push(kinkCategory);
    });

    return kinksInfo;

};

function getUsername() {
    var username = prompt("Please enter your name");
    if(typeof username !== 'string') return;
    else if (username.length ) username = '(' + username + ')';

    return username;
}



// Constants
const numCols = 6;
const columnWidth = 250;
// const simpleTitleHeight = 35;
const titleSubtitleHeight = 50;
const kinkHeight = 25;

const offsets = {
    left: 10,
    right: 10,
    top: 50,
    middle: 50,
    bottom: 10
};



function renderCanvas(username, kinkInfo) {

    // Initialize columns and drawStacks
    var columns = [];
    for(var i = 0; i < numCols; i++){
        columns.push({ height: 0, categories: 0, drawStack: []});
    }


    const avgColHeight = (
        kinkInfo.categories.length * titleSubtitleHeight
        + kinkInfo.categories.length * offsets.middle
        + kinkInfo.totalKinks * kinkHeight
    ) / numCols;


    // Sort the kink categories into columns
    var columnIndex = 0;
    for(var kinkCategory of kinkInfo.categories) {
        var kinkCategoryHeight = (
            titleSubtitleHeight
            + kinkCategory.kinks.length * kinkHeight
        );

        // Determine which column to place this category in
        if ((columns[columnIndex].height + (kinkCategoryHeight / 2)) > avgColHeight) columnIndex++;
        while(columnIndex >= numCols) columnIndex--;

        var column = columns[columnIndex];

        // Draw Info for the category
        var drawCall = {
            y: column.height,
            type: 'renderTitleSubtitle',
            data: {
                category: kinkCategory.name,
                fields: kinkCategory.fields,
            },
        };
        column.height += titleSubtitleHeight;
        column.categories += 1;
        column.drawStack.push(drawCall);

        for (var kink of kinkCategory.kinks) {
            var drawCall = {
                y: column.height,
                type: 'renderKinkRow',
                data: {
                    choices: kink.choices,
                    text: kink.name,
                },
            };
            column.height += kinkHeight;
            column.drawStack.push(drawCall);
        }
    }


    // Adjust for the padding
    for(var column of columns) {
        column.height += column.categories * offsets.middle;
    }

    var tallestColumnHeight = 0;
    for(var column of columns) {
        if (tallestColumnHeight < column.height) {
            tallestColumnHeight = column.height;
        }
    }

    // Now Draw it all on the canvas
    const canvasWidth = offsets.left + offsets.right + (columnWidth * numCols);
    const canvasHeight = offsets.top + offsets.bottom + tallestColumnHeight;
    var setup = ExporterCanvas(canvasWidth, canvasHeight, username, colors, columns);

    return setup.canvas;
}





function exportCanvas(username, levels) {
    var kinkInfo = dumpKinkSelection(levels);
    var canvas = renderCanvas(username, kinkInfo);

    return canvas;
}



const imgurClientId = '9db53e5936cd02f';
function ImgurExport(canvas) {
    $('#URLLoading').fadeIn();

    // Send canvas to imgur
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: {
            // Your application gets an imgurClientId from Imgur
            Authorization: 'Client-ID ' + imgurClientId,
            Accept: 'application/json'
        },
        data: {
            // convert the image data to base64
            image:  canvas.toDataURL().split(',')[1],
            type: 'base64'
        },
        success: function(result) {
            $('#URLLoading').hide();
            var url = 'https://i.imgur.com/' + result.data.id + '.png';
            $('#URL').val(url).fadeIn();
            $('#PreviewOverlay').fadeOut();
        },
        fail: function(){
            $('#URLLoading').hide();
            alert('Failed to upload to imgur, could not connect');
        }
    });
}
