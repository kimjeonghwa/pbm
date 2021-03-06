import { 
  SELECT_PRODUCT,
  APPLY_TEMPLATE,
  JUMP_TO_PAGE,
  ADD_IMAGE_TO_FRAME,
  ADD_TEXT_TO_FRAME,
  NEXT_PAGE,
  PREVIOUS_PAGE,
  UPDATE_IMAGE_POSITION,
  SET_HAS_APPLIED_COVERS,
} from '../actions/types';

const initialState = {
  current : null,
  pages : [],
  hasAppliedCovers: false,
};

export default function(state = initialState, action) {
  switch(action.type) {
    case SELECT_PRODUCT: {
      let i = 0;
      return {
        ...state,
        pages: Array(action.payload.pageNumber).fill({
          id : i,
          rows : 0,
          columns : 0,
          area : '',
          images: [],
          texts: [],
        }),
        current: 0,
      }
    }
    case APPLY_TEMPLATE: {
      let templatePageIndex = Math.floor((action.index + 1) % 2);
      if (action.payload.type === "front" || action.payload.type === "back")
        templatePageIndex = 0;
      return Object.assign({}, state, {
        pages : state.pages.map((page, index) => {
          if (index !== action.index) {
            return page;
          }
          return Object.assign({}, page, {
            rows: action.payload.pages[templatePageIndex].rows,
            columns: action.payload.pages[templatePageIndex].columns,
            area: action.payload.pages[templatePageIndex].area,
            images: action.payload.pages[templatePageIndex].images,
            texts: action.payload.pages[templatePageIndex].texts,
          });
        }),
      });
    }
    case JUMP_TO_PAGE: {
      return {
        ...state,
        current : action.payload,
      };
    }
    case PREVIOUS_PAGE: {
      let newCurrent = state.current;
      if (newCurrent !== 0 && (newCurrent -1) >= 0)
        newCurrent = newCurrent -1;
      return {
        ...state,
        current: newCurrent
      };
    }
    case NEXT_PAGE: {
      let newCurrent = state.current;
      let maxPages = Math.floor(state.pages.length/2) + 1;
      if ((newCurrent+1) < maxPages)
        newCurrent = newCurrent + 1;
      return {
        ...state,
        current: newCurrent,
      };
    }
    case ADD_IMAGE_TO_FRAME: {
      return Object.assign({}, state, {
        pages : state.pages.map((page, index) => {
          if (index !== action.index) {
            return page;
          }
          return Object.assign({}, page, {
            images : page.images.map((image) => {
              if (image.id !== action.id) {
                return image;
              }
              return Object.assign({}, image, {
                source : action.payload,
                offset: {offsetX: 0, offsetY: 0}
              });
            }),
          });
        }),
      });
    }
    case UPDATE_IMAGE_POSITION: {
      return Object.assign({}, state, {        
        pages : state.pages.map((page, index) => {
          if (index !== action.index) {
            return page;
          }
          return Object.assign({}, page, {
            images : page.images.map((image) => {
              if (image.id !== action.id) {
                return image;
              }

              return Object.assign({}, image, {
                offset: action.payload
              });
            }),
          });
        }),
      })
    }
    case ADD_TEXT_TO_FRAME: {
      return Object.assign({}, state, {
        pages : state.pages.map((page, index) => {
          if (index !== action.index) {
            return page;
          }
          return Object.assign({}, page, {
            texts : page.texts.map((text) => {
              if (text.id !== action.id) {
                return text;
              }
              return Object.assign({}, text, {
                value : action.payload,
              });
            }),
          });
        }),
      });
    }
    case SET_HAS_APPLIED_COVERS: {
      return {
        ...state,
        hasAppliedCovers: true,
      }
    }
    default:
      return state;
  }
}