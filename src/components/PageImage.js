import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom';
import { DropTarget } from 'react-dnd';
// import fireworks from '../images/fireworks.jpg';
// import humananddog from '../images/humananddog.jpg';
// import { addImageToFrame } from '../actions/pageActions';
import '../styles/PageImage.css';


const Types = {
  IMAGE: 'IMAGE'
};

const VIEW_CALL_BACK_ENUMS = {
  ADD_IMAGE_TO_FRAME: 'ADD_IMAGE_TO_FRAME',
};

const imageTarget = {
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }
    let imageURL = monitor.getItem().imageURL;
    let idPattern = /\d+/g;
    let parsedId = parseInt((props.value.id).match(idPattern));
    // props.addImageToPage(parsedId, imageURL);
    // props.addImageToPage(props.value.id, imageURL);
    props.callbackHandler(
      VIEW_CALL_BACK_ENUMS.ADD_IMAGE_TO_FRAME,
      {
        id: props.value.id,
        value: imageURL,
      },
    );
    return;
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
    canDrop: monitor.canDrop(),
  };
}

class PageImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
      imageAspect: 0,
      elementAspect: 0,
      imageWidth: 0,
      imageHeight: 0,
      elementWidth: 0,
      elementHeight: 0,
      moveVertical: false,
      currX: 0,
      currY: 0,
      movingDown: false
    }
    
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  onMouseDown(e) {
    let i = new Image();
    i.src = this.props.value.source;

    let imageWidth = i.width;
    let imageHeight = i.height;
    let elementWidth = e.target.clientWidth;
    let elementHeight = e.target.clientHeight;
    let imageAspect = i.width / i.height;
    let elementAspect = e.target.clientWidth / e.target.clientHeight;
    let multiplier = 1;
    let moveVertical = false;
    let imageBoundaryX = this.state.imageWidth - this.state.elementWidth;
    let imageBoundaryY = this.state.imageHeight - this.state.elementHeight;

    if (imageAspect < elementAspect) {  // calculate multiplier to get real image dimensions
      multiplier = imageWidth / elementWidth;
    } else {
      multiplier = imageHeight / elementHeight;
    }

    imageWidth /= multiplier;
    imageHeight /= multiplier;

    if (elementAspect > imageAspect) {
      moveVertical = true;
    }

    this.setState({
      startX: e.pageX,
      startY: e.pageY,
      imageAspect: imageAspect,
      elementAspect: elementAspect,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      elementWidth: elementWidth,
      elementHeight: elementHeight,
      moveVertical: moveVertical,
      imageBoundaryX: imageBoundaryX,
      imageBoundaryY: imageBoundaryY
    });

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
  }

  onMouseMove(e) {
    let offsetX = 0;
    let offsetY = 0;
    let currX = this.state.currX;
    let currY = this.state.currY;

    if (this.state.moveVertical) {  // moving vertically
      offsetY = e.pageY - this.state.startY;  // calculate mouse position offset

      currY += this.state.offsetY - offsetY;  // update y-position of image from top

      if (offsetY == this.state.offsetY) return;  // no movement, skip to reduce setState calls

      if (offsetY >= this.state.offsetY) {  // moving down
        if (currY < 0) {  // image at top, set everything to 0
          offsetY = 0;
          currY = 0;
        }
      } else {
        if (currY > this.state.imageBoundaryY) { // image reached bottom, set everything to boundary
          offsetY = this.state.imageBoundaryY * -1;
          currY = this.state.imageBoundaryY;
        }
      }

      this.setState({ offsetY: offsetY, currY: currY });
    } 

    e.preventDefault();
  }

  onMouseUp(e) {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    e.preventDefault();
  }

  render() {
    const { connectDropTarget, isOver, canDrop } = this.props;
    const style = JSON.parse(this.props.value.style);
    
    let imageStyle = {
      backgroundImage: "url(" + this.props.value.source + ")",
      backgroundPositionY: this.state.offsetY + "px",
      backgroundPositionX: this.state.offsetX + "px"
    }

    return connectDropTarget(
      <div className="imageFrame" style={style}>
        <div className="imageContainer" style={imageStyle} onMouseDown={this.onMouseDown}>
        </div>
      </div>
    )
  }
}

PageImage.propTypes = {
}

const mapStateToProps = (state) => {
  return {
    pages: state.pages.pages
  };
}

PageImage = connect(mapStateToProps, {})(PageImage);
PageImage = DropTarget(Types.IMAGE, imageTarget, collect)(PageImage);

export default PageImage;
export { VIEW_CALL_BACK_ENUMS as CALL_BACK_ENUMS };