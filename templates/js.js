var net_data = {
    name: "bayes_net_one",
    nodes: [],
    type: "causal",
    //rest_handler_url: null,
    data_nodes: []
};
var net_data_example = {
    "net_name": "bayes_net_1",
    "nodes": [
        {
            "id": 0,
            "name": "Факт1",
            "conditional": true, //если тру условная вероятность если фалс безусловная
            "relations": [{"SOURCE": 0, "destination": 1}, {"source": 0, "destination": 2}], // связи. хранятся связь откуда куда исходящие(пока)
            "cpt": [
                null
            ],
            "states": []

        }

    ],
    "type": "classic", // or ???
    "rest_handler_url": null,
    "data_nodes": [     // данные для этой сети то есть выбранные переменные
        {"1": 1, "2": 1}
    ]
};
var width = $("#divWith").width() - $("#minus").width() + 100;
var height = window.innerHeight;
var stage = new Konva.Stage({
    container: 'canvas',
    width: width,
    height: height
});
var layer = new Konva.Layer();
window.FactsId = 1;
window.HypothesisId = 1;
stage.add(layer);

function AddState() {

    var name = $("#StateName").val();

    $("#StateDiv").append(
        '<div class="m-2"> <span class="state">' + name + '</span>' + '<button class="btn btn-outline-danger my-2 my-sm-0 ml-3 mr-3" onclick="DeleteState()"><i class="fa fa-times" aria-hidden="true"></i>\n </button> </div>'
    )

}


function AddFact() {
    var circle = new Konva.Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 35,
        fill: 'transparent',
        stroke: 'blue',
        strokeWidth: 4,
        draggable: true,
        id: 'F' + window.FactsId
    });
    circle.setAttr('name', 'Факт ' + FactsId);

    var text = new Konva.Text({
        x: circle.getX(),
        y: circle.getY() + 10,
        text: circle.getAttr('id'),
        fontSize: 15,
        fontFamily: 'Calibri',
        fill: 'green',
        id: 'T' + circle.getAttr('id')
    });

    layer.add(circle);
    layer.add(text);
    layer.draw();

    $('#select2').append(
        ' <option>' + 'F' + FactsId + '</option>'
    );


    window.FactsId = window.FactsId + 1;

    circle.on('click touchend', function () {
            id = circle.getAttr('id');
            // делаем дату для определенного факта
            $('#settingsModal').attr('data-name', circle.attrs.name);
            $('#settingsModal').attr('data-circle1', id);
            $('#settingsModal').attr('data-labelOps', 'Описание факта');

            // расставляем дату в определенные элементы
            $('.modal-title').text($('#settingsModal').attr('data-name'));
            $('#circle1').val($('#settingsModal').attr('data-circle1'));
            $('#labelOps').text($('#settingsModal').attr('data-labelOps'));
            $('#deleteCircle').on('click', function () { // удаление ноды
                RemoveCircle(id);
            });
            $('#saveNode').on('click', function () {  //сохраннеие ноды
                SaveNode(id);
            });

            SetSettingsNode(id); //заполняем настройки если есть


            // открываем модальное окно настроек
            $('#settingsModal').modal('toggle')

        }
    );
    circle.on('dragmove', function () {
        TextMove(circle.getAttr('id'));
        if (layer.find('Arrow')) {
            ArrowMove(circle.getAttr('id'))

        }
    });


}

function AddHypothesis() {
    var circle = new Konva.Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 35,
        fill: 'transparent',
        stroke: 'purple',
        strokeWidth: 4,
        draggable: true,
        id: 'H' + HypothesisId
    });
    circle.setAttr('name', 'Гипотеза ' + FactsId);

    var text = new Konva.Text({
        x: circle.getX(),
        y: circle.getY() + 10,
        text: circle.getAttr('id'),
        fontSize: 15,
        fontFamily: 'Calibri',
        fill: 'green',
        id: 'T' + circle.getAttr('id')
    });

    layer.add(circle);
    layer.add(text);
    layer.draw();


    $('#select2').append(
        ' <option>' + 'H' + HypothesisId + '</option>'
    );

    circle.on('click touchend', function () {
            id = circle.getAttr('id');
            // делаем дату для определенного факта
            $('#settingsModal').attr('data-name', circle.attrs.name);
            $('#settingsModal').attr('data-circle1', id);
            $('#settingsModal').attr('data-labelOps', 'Описание факта');

            // расставляем дату в определенные элементы
            $('.modal-title').text($('#settingsModal').attr('data-name'));
            $('#circle1').val($('#settingsModal').attr('data-circle1'));
            $('#labelOps').text($('#settingsModal').attr('data-labelOps'));
            $('#deleteCircle').on('click', function () {
                RemoveCircle(id);
            });


            // открываем модальное окно настроек
            $('#settingsModal').modal('toggle')

        }
    );

    window.HypothesisId = window.HypothesisId + 1;


    circle.on('dragmove', function () {
        TextMove(circle.getAttr('id'));
        if (layer.find('Arrow')) {
            ArrowMove(circle.getAttr('id'));

        }
    });

}


function ClearWorkSpace() {
    stage.destroyChildren();
    $('#select2').html('');
    FactsId = 1;
    HypothesisId = 1;
    stage.add(layer)
}

function Connect() {
    circle1ID = $('#circle1').val();
    circle2ID = $('#select2').val();
    circle1 = layer.findOne('#' + circle1ID);
    circle2 = layer.findOne('#' + circle2ID);

    var arrow = new Konva.Arrow({
        points: [circle1.getX(), circle1.getY(), circle2.getX(), circle2.getY()],
        pointerLength: 10,
        pointerWidth: 10,
        fill: 'black',
        stroke: 'black',
        strokeWidth: 2,
        id: 'arrow' + circle1ID + circle2ID
    });
    arrow.setAttr('circleOne', circle1ID);
    arrow.setAttr('circleTwo', circle2ID);
    layer.add(arrow);
    layer.draw();


}

function ArrowMove(id) {
    var arrowsOutgoing = [];
    var arrowsIncoming = [];
    var circleAnotherOutgoing = [];
    var circleAnotherIncoming = [];
    var arrows = layer.find('Arrow');
    var circle = layer.findOne('#' + id);
    for (var i = 0; i < arrows.length; i++) {
        if (arrows[i].attrs.circleOne == id.toString()) {
            arrowsOutgoing.push(arrows[i]);
            circleAnotherOutgoing.push(layer.findOne('#' + arrows[i].attrs.circleTwo));
        }

        if (arrows[i].attrs.circleTwo == id.toString()) {
            arrowsIncoming.push(arrows[i]);
            circleAnotherIncoming.push(layer.findOne('#' + arrows[i].attrs.circleOne));

        }
    }


    for (var i = 0; i < arrowsOutgoing.length; i++) {
        if (arrowsOutgoing.length) {
            arrowsOutgoing[i].setAttr('points', [circle.getX(), circle.getY(), circleAnotherOutgoing[i].getX(), circleAnotherOutgoing[i].getY()]);

        }
    }
    for (var i = 0; i < arrowsIncoming.length; i++) {
        if (arrowsIncoming.length) {
            arrowsIncoming[i].setAttr('points', [circleAnotherIncoming[i].getX(), circleAnotherIncoming[i].getY(), circle.getX(), circle.getY()]);
            layer.draw()
        }
    }


}

function TextMove(id) {
    var text = layer.findOne('#T' + id);
    var circle = layer.findOne('#' + id);
    text.setAttr('x', circle.getX());
    text.setAttr('y', circle.getY() + 10);
    layer.draw()

}

function RemoveCircle(id) {
    var circle = layer.findOne('#' + id);
    var text = layer.findOne('#T' + id);
    var arrows = [];

    var arrowslayer = layer.find('Arrow');

    for (var i = 0; i < arrowslayer.length; i++) {
        if (arrowslayer[i].attrs.circleOne == id) {
            arrows.push(arrowslayer[i]);
        }

        if (arrowslayer[i].attrs.circleTwo == id) {
            arrows.push(arrowslayer[i]);
        }
    }
    console.log(arrows[0]);

    for (var i = 0; i < arrows.length; i++) {
        arrows[i].destroy()
    }

    $('option:contains(' + id + ')').remove();

    circle.destroy();
    text.destroy();
    layer.draw();
    $('#settingsModal').modal('toggle')
}

function SaveNode(id) {

    var node = {
        id: id,
        name: $("#nodeName").val(),
        conditional: true, //если тру условная вероятность если фалс безусловная
        relations: {
            source: [],
            destination: []
        }, // связи.
        cpt: [],
        states: []

    };
    var a = $(".state");

    for (var i = 0; i < a.length; i++) {
        node.states.push(a[i].textContent);
        console.log(a[i].textContent)
    }

    if (node.cpt.length > 0) {
        //TODO логика для сохранения тув
    }

    var arrows = layer.find('Arrow');
    for (var i = 0; i < arrows.length; i++) {
        if (arrows[i].attrs.circleOne == id.toString()) {
            node.relations.source.push(arrows[i].attrs.circleTwo)

        }

        if (arrows[i].attrs.circleTwo == id.toString()) {
            node.relations.destination.push(arrows[i].attrs.circleOne)
        }
    }


    net_data.nodes.push(node);
    $('#settingsModal').modal('toggle')

}

function SetSettingsNode(id) {
    for (var i = 0; i < net_data.nodes.length; i++) {
        if (net_data.nodes[i].id == id) {
            var node = net_data.nodes[i];
            break;
        }
    }

    if (node) {

        $("#nodeName").val(node.name);

        for (var i = 0; i < node.states.length; i++) {
            $("#StateDiv").append(
                '<div class="m-2"> <span class="state">' + node.states[i] + '</span>' + '<button class="btn btn-outline-danger my-2 my-sm-0 ml-3 mr-3" onclick="DeleteState()"><i class="fa fa-times" aria-hidden="true"></i>\n </button> </div>'
            )
        }

        //TODO логика для ТУВ

    }
    else {
        $("#nodeName").val('');
        $("#StateDiv").html('')
    }
}

function GenerateCPT(id) {

    var node = null;
    var relations = []

}