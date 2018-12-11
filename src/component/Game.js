import React, {Component} from 'react'
import _ from 'lodash'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faCheck, faTimes, faRedo } from '@fortawesome/free-solid-svg-icons'
import './styles/Game.css';
library.add({faStar, faCheck, faTimes, faRedo})

var possibleCombinationSum = function(arr, n) {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
        arr.pop();
        return possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount ; i++ ) {
        var combinationSum = 0;
        for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
        }
        if (n === combinationSum) { return true; }
    }
    return false;
};

const Star = (props) => {
    const numberOfStars = props.randomNumber;
    return(
        <div className="col-5"> 
            {_.range(numberOfStars).map(
                i => <i className="star"> <FontAwesomeIcon icon={faStar} /> </i>
            )}
        </div>
    )
}

const Button = (props) => {

    let button;
    switch (props.answerIsCorrect) {
        case true:
            button = <button className="btn btn-success" onClick = {props.acceptAnswer}> <FontAwesomeIcon icon={faCheck} /> </button>
            break;
        case false:
            button = <button className="btn btn-danger"> <FontAwesomeIcon icon={faTimes} /> </button>
            break;
    
        default:
            button = <button className="btn" disabled={props.selectedNumbers.length === 0} 
            onClick = {props.checkAnswer}> = </button>
            break;
    }

    return(
        <div className="col-2">
            {button}
            <br />
            <br />
            <button className="btn btn-warning btn-sm"  
                    disabled={ props.redraws === 0 } 
                    onClick={props.redraw} > 
                        <FontAwesomeIcon icon={faRedo} /> {props.redraws} 
            </button>
        </div>
    )
}

const Answer = (props) => {
    return(
        <div className="col-5">
            { props.selectedNumbers.length > 0 ? 
                props.selectedNumbers.map( (num, i ) => <span className="btn-number" key={i} onClick={()=> props.removeSeletedNumber(num)}> {num} </span>) 
                : ''
            }
        </div>
    )
}

const Numbers = (props) => {
    const numberClassName = (number) => {
        if(props.selectedNumbers.indexOf(number) >= 0){
            return 'selected';
        }
        if(props.usedNumbers.indexOf(number) >= 0){
            return 'used';
        }
    }
    return (
        <div className="card text-center">
            <div>
                {
                    Numbers.list.map( (number, i) =>
                        <span  key={i} 
                        onClick={ () => props.selectNumber(number) } className={numberClassName(number)}> {number} </span>
                    )
                }
            </div>
        </div>
    )
};
Numbers.list = _.range(1,10);

const DoneFrame = (props) =>{
    return(
        <div  className="text-center">
            <h2> {props.doneStatus}! </h2>
            <button className="btn btn-secondary" onClick={props.resetGame}>Play Again</button>
        </div>
    )

}

class Game extends Component {
    static randomNumber = () => 1 + Math.floor(Math.random() * 9);
    state = {
        selectedNumbers: [],
        randomNumber: Game.randomNumber(),
        answerIsCorrect: null,
        usedNumbers : [],
        redraws: 5,
        doneStatus: null
    }
    selectNumber = (clickedNumber) => {
        if(this.state.selectedNumbers.indexOf(clickedNumber) <= -1 
            && this.state.usedNumbers.indexOf(clickedNumber) <= -1){
            this.setState( prevState => ({
                answerIsCorrect: null,
                selectedNumbers: prevState.selectedNumbers.concat(clickedNumber) 
            }) )
        }
    }
    removeSeletedNumber = (number) => {
        this.setState( prevState => ({
            answerIsCorrect: null,
            selectedNumbers: prevState.selectedNumbers.filter( num => num !== number )
        }) )
       
    }

    checkAnswer = () =>{
        this.setState( prevState =>({
            answerIsCorrect: prevState.randomNumber === prevState.selectedNumbers.reduce( (acc, num) => acc + num, 0 )
        }) )
    }

    acceptAnswer = () => {
        this.setState( 
            prevState => ({
                usedNumbers: prevState.usedNumbers.concat( prevState.selectedNumbers ),
                answerIsCorrect: null,
                selectedNumbers: [],
                randomNumber: Game.randomNumber()
            }
        ), this.updateDoneStatus )
    }

    redraw = () => {
        if( this.state.redraws === 0 ) { return; }
        this.setState( prevState => ({
            randomNumber: Game.randomNumber(),
            selectedNumbers: [],
            answerIsCorrect: null,
            redraws: prevState.redraws - 1
        }), this.updateDoneStatus)
    }

    possibleSolutions = ({randomNumber, usedNumbers}) => {
        const possibleNumbers = _.range(1,10).filter( number =>  usedNumbers.indexOf(number) === -1 )
        return possibleCombinationSum(possibleNumbers, randomNumber)
    }

    updateDoneStatus = () => {
        this.setState(prevState => {
            if( prevState.usedNumbers.length === 9){
                return {doneStatus: 'Done. Nice'}
            }

            if( prevState.redraws === 0 && !this.possibleSolutions(prevState) ){
                return {doneStatus: 'Game over'}
            }
        })
    } 

    resetGame = () => {
        this.setState({
            selectedNumbers: [],
            randomNumber: Game.randomNumber(),
            answerIsCorrect: null,
            usedNumbers : [],
            redraws: 5,
            doneStatus: null
        })
    }

    render(){
        const {
            randomNumber,
            selectedNumbers,
            answerIsCorrect,
            usedNumbers,
            redraws,
            doneStatus
        } = this.state;
        return(
            <div className="container">
                <h3> Play Nine Nine </h3>
                <hr/>
                <div className="row text-center">
                    <Star randomNumber ={randomNumber}/>
                    <Button selectedNumbers={selectedNumbers} 
                            checkAnswer = { this.checkAnswer } 
                            answerIsCorrect = {answerIsCorrect} acceptAnswer={this.acceptAnswer} redraw={this.redraw} redraws={redraws}/>
                    <Answer selectedNumbers={selectedNumbers} removeSeletedNumber={this.removeSeletedNumber}/>
                </div>
                <hr />
                {
                    (doneStatus) ? <DoneFrame doneStatus={doneStatus} resetGame={this.resetGame}/> : <Numbers selectedNumbers={selectedNumbers} selectNumber={this.selectNumber} usedNumbers={usedNumbers} />
                }
                
            </div>
        )
    }
}

export default Game