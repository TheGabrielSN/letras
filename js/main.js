/**
* Player data
* @param {String}               name        Name of player
* @param {Integer}              chances     Chances to get the word right
* @param {HTMLParagraphElement} selector    Player score
* @param {HTMLDivElement}       div         Score position div
*/
class Player{
    constructor(name, chances, selector, div){
        this.point = 0;
        this.name = name;
        this.chance = chances;

        this.player_field = document.querySelector(selector);
        this.player_div = document.querySelector(div);
    }

    /**
     * Add point to player
     * @function add_point
     */

    add_point(){
        this.point++;
    }
}

/**
 * Generate Random Values
 */
class Random{
    constructor(){
        let request = new XMLHttpRequest();
        request.open('GET', "https://raw.githubusercontent.com/TheGabrielSN/letras/main/database/br-utf8.txt", false);
        request.send(null);

        this.dic = request.response.split('\n');        

        this.images_correct = ['database/img/correct/01_TG.gif', 'database/img/correct/02_Hornet.gif', 'database/img/correct/03_Knight.gif',
                                'database/img/correct/04_Knight.webp', 'database/img/correct/05_Knight.gif'];
        this.images_incorrect = ['database/img/incorrect/01-Lords.webp', 'database/img/incorrect/02-Quirrel.webp', 'database/img/incorrect/03-mushroom.gif',
                                'database/img/incorrect/04-Aspid.gif', 'database/img/incorrect/05-Souls.gif', 'database/img/incorrect/06-Knight.webp'];
    }

    /**
     * Generate a random integer in range
     * @param {Integer} min Start value of range
     * @param {Integer} max Stop value of range
     * @returns {Integer}   Random value
     */
    generate_random_int(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Select a random word
     * @returns {String} Random word
     */
    random_word(){
        let index = this.generate_random_int(0, this.dic.length);
        var word = this.dic[index];

        while(word.length < 5){
            let index = this.generate_random_int(0, this.dic.length-1);
            let word = this.dic[index];
        }

        return this.dic[index];
    }

    /**
     * Select a random image correct
     * @returns {String} Path of image
     */
    random_img_correct(){
        let index = this.generate_random_int(0, this.images_correct.length-1);
        return this.images_correct[index];
    }

    /**
     * Select a random image incorrect
     * @returns {String} Path of image
     */
    random_img_incorrect(){
        let index = this.generate_random_int(0, this.images_incorrect.length-1);
        return this.images_incorrect[index];
    }
}

/**
 * Page layout control
 */
class Layout{
    constructor(){
        // Variaveis de cor
        this.color_corret_grad = ['#5ff65f','#0c3619'];
        this.color_middle_grad = ['#f3f65f', '#34360c'];
        this.color_incorrect_grad = ['#f65f5f', '#360c0c'];
        this.color_loser_grad = ['#6c5555', '#000000'];
        this.color_base_grad_body = ['#727272','#727272'];
    }

    /**
     * Modify gradient of object
     * @param {HTMLElement} obj         Element HTML for modify gradient 
     * @param {TextTrackList} colour1   List with two gradient colors ||
     * @param {String} colour1          Color starting gradient
     * @param {String} colour2          (Optional) Gradient end color
     */
    gradient(obj, colour1, colour2 = null){

        if(colour2 == null){
            colour2 = colour1[1];
            colour1 = colour1[0];
        }

        var gradientString = '\
            /* Mozilla Firefox */ \
            background-image: -moz-linear-gradient(top, {colour1} 0%, {colour2} 100%);\
            /* Opera */ \
            background-image: -o-linear-gradient(top, {colour1} 0%, {colour2} 100%);\
            /* Webkit (Safari/Chrome 10) */ \
            background-image: -webkit-gradient(linear, left top, left bottom, color-stop(0, {colour1}), color-stop(1, {colour2}));\
            /* Webkit (Chrome 11+) */ \
            background-image: -webkit-linear-gradient(top, {colour1} 0%, {colour2} 100%);\
            /* IE10+ */\
            background: -ms-linear-gradient(top,  {colour1} 0%,{colour2} 100%);\
            /* W3C */\
            background: linear-gradient(top,  {colour1} 0%,{colour2} 100%);\
        ';
    
        gradientString = gradientString.replace(/\{colour1\}/g, colour1).replace(/\{colour2\}/g, colour2)
    
        obj.setAttribute('style', obj.getAttribute('style') + '; ' + gradientString);
    }
}

/**
 * Generate and controler game
 * @param {Integer} num_word    Number of words
 * @param {String}  name1       Name of player 1
 * @param {String}  name2       Name of player 2
 */
class Game{
    constructor(num_word, name1, name2){
        // Visual
        this.layout = new Layout();

        // RandomWord
        this.rw = new Random();

        // Variaveis de objetos
        this.prest = document.querySelector('p.rest');              // Valor de tentativas restantes
        this.pos_word = document.querySelector('.word');            // Palavra(s)
        this.divrest = document.querySelector('div.rest');          // Área de tentativas restantes
        this.input = document.querySelector('.inputletra');         // Área de entrada de palavras
        this.attempts = document.querySelector('.attempts');        // Letras já adicionadas
        this.imageValue = document.querySelector('img.img');        // Imagem de fim de partida
        this.newgame = document.querySelector('div.new_game');      // Botão de novo jogo
        this.imageLocation = document.querySelector('div.img');     // Apresentação da imagem
        this.letter_input = document.querySelector('div.letter');   // Entrada de palavras

        // Variaveis de controle
        this.ok = 0;                                                // Quantidade de letras acertadas pelo úsuario
        this.word = [];                                             // lista de palavras
        this.acept = false;                                         // Acertou a ultima palavra tentada
        this.letter = 0;                                            // Quantidade de letras em cada palavra
        this.aceptWord = 0;                                         // Quantidade de palavras acertadas
        this.responses = [];                                        // Letras ditas pelo úsuario
        this.quantity = num_word;                                   // Quantidade de palavras

        // Jogadores
        this.p1 = new Player(name1, 3, "p#p1", "div#player1");

        name2 ? this.p2 = new Player(name2, 3, "p#p2", "div#player2") :  this.p2 = null;

        this.current = this.p1;
    }

    /**
     * Clear self values
     */
    destructor(){
        this.current = null;
        this.p1 = null;
        this.p2 = null;

        this.attempts.textContent = '';
    }

    /**
     * Starting game
     */
    start(){
        this.divrest.style.display = 'none';
        this.prest.textContent = '';
        this.layout.gradient(this.divrest, this.layout.color_corret_grad);

        this.layout.gradient(document.body, '#727272', '#727272');

        this.pos_word.textContent = '';
        this.newgame.style.display = 'none';
        this.imageLocation.style.display = 'none';

        this.letter_input.style.display = 'block';

        this.chance = 3;

        for(var i=0; i<this.quantity; i++){
            this.word.push(this.rw.random_word());
            this.letter += this.word[i].length;
        }

        this.generate();
        this.input.focus();

        if(this.p1.point > 0){
            this.p1.player_div.style.display = 'block';
            this.p1.player_field.textContent = this.p1.point;
        }

        if(this.p2){
            if(this.p2.point > 0){
                this.p2.player_div.style.display = 'block';
                this.p2.player_field.textContent = this.p2.point;
            }
        }
    }

    /**
     * End of game
     */
    end(){
        this.word = [];
        this.responses = [];
        this.attempts.textContent = '';
        this.ok = 0;
        this.letter = 0;
        this.acept = 0;
        this.acept = false;
        this.p1.chance = 3;
        
        this.p2!=null ? this.p2.chance = 3 : null;
        
        localStorage.setItem('p1_name', this.p1.name);
        localStorage.setItem('p1_point', this.p1.point);
        if(this.p2){
            localStorage.setItem('p2_name', this.p2.namel);
            localStorage.setItem('p2_point', this.p2.point);
        }
        this.newgame.focus();
    }
    
    /**
     * On-screen word generation
     */
    generate(){
        var _table = document.createElement('table')
    
        var format = /[!@#$%&*()_+\-=\[\]{};:"\\|,.<>\/?]+/;
    
        for(var i=0; i<this.quantity; i++){
            var _row = document.createElement('tr');
            for(let pos in this.word[i]){
                var _column = document.createElement('td');
                _column.id = `column${i}`;
                _column.classList.add('column');
                var _txt = document.createElement('p');
                if(format.test(this.word[i][pos]) == true){
                    _txt.textContent = `${word[i][pos]}`.toUpperCase();
                    _txt.style.backgroundColor = '#DC7508';
                }
                //_txt.append(``)
                _column.append(_txt)
                _row.append(_column);
            }
            _table.append(_row);
        }
        
        this.pos_word.append(_table);
    }

    /**
     * Play hit check control
     */
    verificar(){
        var letra = this.input.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        var acept = false;
    
        for(var i=0; i<this.quantity; i++){
            var letters = document.querySelectorAll(`td#column${i}`);
            var diff = this.letter - this.ok;
    
            if(diff <= 3){
                var text = document.querySelector('.textletra');
                
                text.textContent = 'Digite a palavra: ';
                this.divrest.style.display = 'flex';
                this.prest.textContent = this.chance;
            }
    
            if(letra.length == this.word[i].length || diff <= 3){
                var acept = this.verify_word(letters, letra, i, this.acept);
                acept ? this.acept = acept : this.acept = this.acept;

                if(acept){
                    this.current.add_point();
                    this.p1.player_div.style.display = 'block';
                    this.p1.player_field.textContent = this.p1.point;

                    if(this.p2){
                        console.log("Foi aqui");
                        this.p2.player_div.style.display = 'block';
                        this.p2.player_field.textContent = this.p2.point;
                    }
                }

            } else if (letra.length == 1 & diff > 3){
                acept = this.verify_letter(letters, letra, i);
                acept ? this.acept = acept : this.acept = this.acept;
            } else {
                console.log("erro");
            }
        }

        var notice = document.querySelector("p#textNotice");

        this.chance = this.current.chance;

        if(!this.acept & this.current == this.p1 & this.p2!=null){
            if(this.p2.chance > 0){
                this.current = this.p2;
                notice.textContent = `
                Vez do jogador 2 - ${this.current.name}!
                `;
                $('#ModalMensage').modal();
                console.log("Player 2");
            }
        } else if(!this.acept & this.current == this.p2){
            if(this.p1.chance > 0){
                this.current = this.p1;
                notice.textContent = `
                Vez do jogador 1 - ${this.current.name}!
                `;
                $('#ModalMensage').modal();
                console.log("Player 1");
            }
        }
    
        this.verify_equal();

        this.acept = false;
    
        this.input.value = '';
        this.input.focus();
    }

    /**
     * End of game check
     */
    verify_equal(){
        if(this.aceptWord >= this.quantity){
            console.log('Fim de jogo');

            this.imageValue.src = this.rw.random_img_correct();
            this.imageLocation.style.display = 'block';
    
            this.layout.gradient(document.body, this.layout.color_corret_grad);
    
            setTimeout(() => {
                this.newgame.style.display = 'block';
                this.letter_input.style.display = 'none';
                this.end();
            }, 100);
        }
    }

    /**
     * Checks for the existence of a letter in the word
     * @param {NodeListOf<Element>} letters List of elements referring to the words to be displayed
     * @param {String} letter               Represents the hit of some word previously
     * @param {Integer} i                   Index of word to be verified
     * @returns {Boolean}                   Boolean referring to the existence of the letter
     */
    verify_letter(letters, letter, i){
        var acept = false;
        let cont = 0;
        
        for(let pos in this.word[i]){
            var w = this.word[i][pos].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            if(w == letter){
                letters[pos].textContent = `${this.word[i][pos]}`.toUpperCase();
                letters[pos].style.backgroundColor = '#42CD23';
                cont += 1
                acept = true;
            }
        }

        if(!(this.responses.includes(letter)) | this.acept){
            this.ok += cont;
        }
        
        if (!(this.responses.includes(letter))){
            this.attempts.textContent += letter + ' ';
        }
        this.responses.push(letter);

        return acept;
    }

    /**
     * 
     * @param {NodeListOf<Element>} letters List of elements referring to the words to be displayed
     * @param {String} word_response        Word the hit of some word previously
     * @param {Integer} index               Index of word to be verified
     * @param {Boolean} ant                 Represents the hit of some word previously
     * @returns {Boolean}                   Boolean referring to the correctness of the word
     */
    verify_word(letters, word_response, index, ant){
        var w1 = this.word[index].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        var w2 = word_response.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        if(w1 == w2){
            for(let pos in w1){
                this.verify_letter(letters, w1[pos], index);
            }

            this.aceptWord += 1;
    
            return true;
    
        } else if(!ant & index == this.quantity-1){
            if(this.divrest.style.display == 'none'){
                this.divrest.style.display = 'none';
                this.prest.textContent = this.chance;
            } else {
                this.current.chance -= 1;
            }

            this.prest.textContent = this.chance;
            
            this.layout.gradient(document.body, this.layout.color_incorrect_grad);
    
            if(this.chance == 2){
                this.layout.gradient(this.divrest, this.layout.color_middle_grad);
            }
    
            if(this.chance == 1){
                this.layout.gradient(this.divrest, this.layout.color_incorrect_grad);
            }
            
            if(this.chance == 0){
                this.layout.gradient(this.divrest, this.layout.color_loser_grad);
                setTimeout(() => {
                    console.log('Fim de jogo');
                    this.imageValue.src = this.rw.random_img_incorrect();
                    this.imageLocation.style.display = 'block';
                    this.newgame.style.display = 'block';
                    this.letter_input.style.display = 'none';
                    this.revelate();
                    this.end();
                }, 100);
            } else {
                setTimeout(() => {
                    this.layout.gradient(document.body, '#727272', '#727272');
                }, 2200);
            }
    
            return false;
        }
    }

    /**
     * Reveals the rest of the word in case of game loss
     */
    revelate(){
        for(var i=0; i<this.quantity; i++){
            var letters = document.querySelectorAll(`td#column${i}`);
            var w1 = this.word[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            for(let pos in w1){
                if(letters[pos].textContent == ''){
                    letters[pos].textContent = `${w1[pos]}`;
                    letters[pos].style.backgroundColor = '#D51A1A';
                    this.ok += 1;
                }
            }
        }
    }
}


// keyboards -> Enter
// Entrada de letra  ou palavra
var inputWord = document.getElementById("letra");
inputWord.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        game.verificar();
    }
});

// Entrada de número de palavras
var inputNumPerson = document.querySelector("#recipient-numWordPerson");
inputNumPerson.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $('#ModalInputNumberWord').modal('hide');
        get_num_person();
    }
});

// Entrada de nome do player 1
var inputName1 = document.querySelector("#recipient-name1");
inputName1.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $('#recipient-name2').focus();
    }
});

// Entrada de nome do player 2
var inputName2 = document.querySelector("#recipient-name2");
inputName2.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $('#ModalInputPlayer').modal('hide');
        getPlayers();
    }
});

// Fechar apresentação de aviso
var closeModal = document.querySelector("#ModalMensage");
closeModal.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        $('#ModalMensage').modal('hide');
        game.input.focus();
    }
});
//

// Funções de controle
/**
 * Create the game with a certain amount of words
 * @param {Integer} num Number of words
 */
function create(num){
    globalThis.game.end();
    globalThis.game = new Game(num, globalThis.n1, globalThis.n2);
    globalThis.game.start();
}

/**
 * Displays information for custom entry
 */
function person(){
    document.querySelector("p#textNoticeNum").textContent = `
    Para melhor experiência, é recomendado a utilização máxima de 5 palavras!
    `;

    document.querySelector(".modal_input").style.display = "block";

    $('#ModalInputNumberWord').modal();

    $('#ModalInputNumberWord').on('shown.bs.modal', function () {
        $('#recipient-numWordPerson').focus();
    })
}

/**
 * Managing custom words input
 */
function get_num_person(){
    num = parseInt(document.querySelector("#recipient-numWordPerson").value);
    create(num);
}

/**
 * Get the players name
 */
function getPlayers(){
    globalThis.n1 = document.querySelector('#recipient-name1').value;
    globalThis.n2 = document.querySelector('#recipient-name2').value;

    globalThis.n2 == '' ? globalThis.n2 = null : null;

    globalThis.game = new Game(1, globalThis.n1, globalThis.n2);
    globalThis.game.start();
}

/**
 * Clear local data;
 */
function reset(){
    localStorage.clear();
    location.reload();
}

// Starting

var n1 = localStorage.getItem('p1_name');
var p1 = localStorage.getItem('p1_point');
var n2 = localStorage.getItem('p2_name') || null;
var p2 = localStorage.getItem('p2_point') || null;

var game = null;


if(n1){
    globalThis.game = new Game(1, globalThis.n1, globalThis.n2);
    globalThis.game.p1.point = globalThis.p1;
    
    globalThis.n2 ? globalThis.game.p2.point = globalThis.p2 : null;
    globalThis.game.start();
} else {
    $('#ModalInputPlayer').modal(
    );
    
    $('#ModalInputPlayer').on('shown.bs.modal', function () {
        $('#recipient-name1').focus();
    })
}