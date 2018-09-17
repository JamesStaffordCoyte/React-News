import React, { Component } from 'react';
import axios from 'axios';
//import logo from './logo.svg';
import './App.css';

// TODO: page 261 file structure

const DEFAULT_QUERY = 'world news';
// Change PARAM_HPP for number of results per page
const DEFAULT_HPP = '1';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

//const URL = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;

class App extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // initial state
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null
    };

    // binding methods
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  // TODO: Change comment
  // Retrieves the searched term from state and sends it to fetchSearchTopStories
  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  // TODO: Fetches the searched term from the API and sends the result to setSearchTopStories
  fetchSearchTopStories(searchTerm, page = 0) {
    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({error}));
  }

  // Sets the result state to the fetched stories
  setSearchTopStories(result) {
    // destructure the results into two variables
    const { hits, page } = result;
    const { searchKey, results } = this.state;
    // Check for whether the searchTerm has been looked up before.
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    // Spread the oldHits and newHits into a new array of all updatedHits
    const updatedHits = [
      ...oldHits,
      ...hits
    ];
    // Set the result state
    this.setState({
      results: {
        ...results,
        [searchKey]: {hits: updatedHits, page }
      }
    });
  }

  // Dismisses the content on page and updates state
  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];
    // Check for filter
    const isNotId = item => item.objectID !== id;
    // Filters out the dismissed content based on its unique id
    const updatedHits = hits.filter(isNotId);
    // Sets state
    this.setState({
      results: {
        ...results,
        [searchKey]: {
          hits: updatedHits,
          page
        }
      }
    });
  }

  // queries the api with the search for term
  onSearchChange(event) {
    // Grabs the value of the search term and updates the state
    this.setState({
      searchTerm: event.target.value
    });
  }

  // Retrieves the state and passes it to the fetchSearchTopStories function and prevents a page refresh
  onSearchSubmit(event) {
    const {searchTerm} = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }

    event.preventDefault();
  }

  render() {
    // set state variables
    const {
      searchTerm,
      results,
      searchKey,
      error
    } = this.state;

    // if no result or page number default to 0
    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const result = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
            value = {searchTerm}
            onChange = {this.onSearchChange}
            onSubmit = {this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        { error
        ? <div class="interaction">
            <p>Something went wrong</p>
          </div>
        :
        <Table
            result={result}
            onDismiss={this.onDismiss}
          />
        }
        <div className="interactions">
          <Button onClick = { () =>
            this.fetchSearchTopStories(searchKey, page + 1)
          }>
            More
          </Button>
        </div>
      </div>
    );
  }
}

// initializes the Search functional component
const Search = ({
  value,
  onChange,
  onSubmit,
  children
}) =>
  <form onSubmit={onSubmit}>
    {children} <input
      type="text"
      value={value}
      onChange={onChange}
    />
    <button type="submit">
      {children}
    </button>
  </form>

// Table component filled with the results of the API query
const Table = ({
  result,
  onDismiss
}) =>
  <div className="table">
  {/* // TODO:  */}
  {result.map(item =>
      <div key={item.objectID} className="table-row">
        <span style={{ width: '40%' }}>
          <a href={item.url}>{item.title}</a>
        </span>
        <span style={{ width: '30%' }}>{item.author}</span>
        <span style={{ width: '10%' }}>{item.num_comments}</span>
        <span style={{ width: '10%' }}>{item.points}</span>
        <span style={{ width: '10%' }}>
          {/* Event handler to add item.objectID into clickable function*/}
          <Button
            onClick={() =>
              onDismiss(item.objectID)}
              className="button-inline"
          >
            Dismiss
          </Button>
        </span>
      </div>
    )}
  </div>

const Button = ({onClick, className, children}) =>
  <button
    onClick={onClick}
    className={className}
    type="button"
  >
    {children}
  </button>

export default App;
