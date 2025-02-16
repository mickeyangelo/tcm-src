import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import AuthContext from './AuthContext';

Modal.setAppElement('#root'); // Required for accessibility

  const LibraryExplorer = () => {
  const { user } = useContext(AuthContext);
  const [libraries, setLibraries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [acts, setActs] = useState([]);
  const [selectedAct, setSelectedAct] = useState(null);
  const [parentActions, setParentActions] = useState([]);
  const [selectedParentAction, setSelectedParentAction] = useState(null);
  const [actions, setActions] = useState([]);

  useEffect(() => {
  console.log("🔄 useEffect triggered! Checking user...");

  if (!user) {
    console.log("❗ No user detected. Using dummy token...");
    const dummyUser = { token: "dummy-token-123" };

    console.log("✅ Dummy user set:", dummyUser);
    fetchLibraries(dummyUser); // Fetch libraries **without setting user**
  } else {
    console.log("✅ User exists. Fetching libraries...");
    fetchLibraries(user);
  }
}, [user]); // Runs when `user` changes


 const fetchLibraries = async (authUser) => {
  console.log("🔹 Starting fetchLibraries...");

  if (!authUser || !authUser.token) {
    console.error("❌ No valid user token found. Skipping fetch.");
    return;
  }

  console.log("🟢 Fetching libraries with token:", authUser.token);

  try {
    const response = await axios.get('http://localhost:5000/api/libraries', {
      headers: { Authorization: `Bearer ${authUser.token}` }
    });

    console.log("✅ Raw API Response:", response);

    if (!response.data || !Array.isArray(response.data)) {
      console.error("❌ Unexpected API response format:", response.data);
      return;
    }

    console.log("📌 Libraries Received:", response.data);

    setLibraries([...response.data]); // Update state

    console.log("✅ State Updated: Libraries set in React state!");

  } catch (err) {
    console.error("❌ Error fetching libraries:", err);
  }
};

  
   const handleAddLibrary = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/libraries', 
        { name: newLibraryName }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setNewLibraryName('');
      setIsModalOpen(false);
      fetchLibraries(); // Refresh the list after adding
    } catch (err) {
      console.error('Error adding library:', err);
    }
  };
  

const fetchBooks = (libraryId) => {
  console.log("📌 Fetching books for library:", libraryId);

  setSelectedLibrary(libraryId);
  setSelectedBook(null);
  setBooks([]); // ✅ Reset books state before fetching new ones
  setSections([]);
  setChapters([]);
  setActs([]);
  setParentActions([]);
  setActions([]);

  axios.get(`http://localhost:5000/api/libraries/${libraryId}/books`, {
    headers: { Authorization: `Bearer ${user.token}` }
  })
  .then(res => {
    console.log("✅ Books Received:", res.data);

    // ✅ Ensure books are only from the selected library
    const filteredBooks = res.data.filter(book => book.library_id === libraryId);
    setBooks(filteredBooks);
    console.log("📌 Updated Books State:", filteredBooks);
  })
  .catch(err => console.error('❌ Error fetching books:', err));
};


  const fetchSections = (bookId) => {
    setSelectedBook(bookId);
    setSelectedSection(null);
    setSections([]);
    setChapters([]);
    setActs([]);
    setParentActions([]);
    setActions([]);

    axios.get(`http://localhost:5000/api/books/${bookId}/sections`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setSections(res.data))
    .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchChapters = (sectionId) => {
    setSelectedSection(sectionId);
    setSelectedChapter(null);
    setChapters([]);
    setActs([]);
    setParentActions([]);
    setActions([]);

    axios.get(`http://localhost:5000/api/sections/${sectionId}/chapters`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setChapters(res.data))
    .catch(err => console.error('Error fetching chapters:', err));
  };

  const fetchActs = (chapterId) => {
    setSelectedChapter(chapterId);
    setSelectedAct(null);
    setActs([]);
    setParentActions([]);
    setActions([]);

    axios.get(`http://localhost:5000/api/chapters/${chapterId}/acts`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setActs(res.data))
    .catch(err => console.error('Error fetching acts:', err));
  };

  const fetchParentActions = (actId) => {
    setSelectedAct(actId);
    setSelectedParentAction(null);
    setParentActions([]);
    setActions([]);

    axios.get(`http://localhost:5000/api/acts/${actId}/parent-actions`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setParentActions(res.data))
    .catch(err => console.error('Error fetching parent actions:', err));
  };

  const fetchActions = (parentActionId) => {
    setSelectedParentAction(parentActionId);
    setActions([]);

    axios.get(`http://localhost:5000/api/parent-actions/${parentActionId}/actions`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    .then(res => setActions(res.data))
    .catch(err => console.error('Error fetching actions:', err));
  };

    return (
    <div>
      <h2>Library Explorer</h2>

      {/* 📌 Button to Open Modal */}
      <button onClick={() => setIsModalOpen(true)}>Add Library</button>

      {/* 📌 Library List */}
      <h3>Libraries</h3>
	  {console.log("Current Libraries State:", libraries)} {/* 🛠 Debug output */}
      {console.log("📌 Rendering Libraries:", libraries)} {/* Debugging output */}

    <ul>
  {libraries.length > 0 ? (
    libraries.map(lib => (
      <li key={lib.id} onClick={() => fetchBooks(lib.id)}>
        {lib.library_name} {/* ✅ Use the correct property name */}
      </li>
    ))
  ) : (
    <p> No libraries found. Try adding one!</p>
  )}
</ul>

{/* 📌 Books Section */}
{selectedLibrary && books.length > 0 && (
  <div>
    <h3>Books</h3>
		{console.log("Current Books State:", books)} {/* 🛠 Debug output */}
		{console.log("📌 Rendering Books:", books)} {/* Debugging output */}
    <ul>
      {books.map(book => (
        <li key={book.id} onClick={() => fetchSections(book.id)}>
          {book.book_title} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if library is selected but has no books */}
{selectedLibrary && books.length === 0 && (
  <p> No books found for this library. Try adding one!</p>
)}

      {/* 📌 Sections Section */}
{selectedBook && sections.length > 0 && (
  <div>
    <h3>Sections</h3>
    <ul>
      {sections.map(section => (
        <li key={section.id} onClick={() => fetchChapters(section.id)}>
          {section.name} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if book is selected but has no sections */}
{selectedBook && sections.length === 0 && (
  <p> No sections found for this book. Try adding one!</p>
)}


{/* 📌 Chapters Section */}
{selectedSection && chapters.length > 0 && (
  <div>
    <h3>Chapters</h3>
    <ul>
      {chapters.map(chapter => (
        <li key={chapter.id} onClick={() => fetchActs(chapter.id)}>
          {chapter.name} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if section is selected but has no chapters */}
{selectedSection && chapters.length === 0 && (
  <p> No chapters found for this section. Try adding one!</p>
)}


{/* 📌 Acts Section */}
{selectedChapter && acts.length > 0 && (
  <div>
    <h3>Acts</h3>
    <ul>
      {acts.map(act => (
        <li key={act.id} onClick={() => fetchParentActions(act.id)}>
          {act.name} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if chapter is selected but has no acts */}
{selectedChapter && acts.length === 0 && (
  <p> No acts found for this chapter. Try adding one!</p>
)}


{/* 📌 Parent Actions Section */}
{selectedAct && parentActions.length > 0 && (
  <div>
    <h3>Parent Actions</h3>
    <ul>
      {parentActions.map(pa => (
        <li key={pa.id} onClick={() => fetchActions(pa.id)}>
          {pa.name} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if act is selected but has no parent actions */}
{selectedAct && parentActions.length === 0 && (
  <p> No parent actions found for this act. Try adding one!</p>
)}

{/* 📌 Actions Section */}
{selectedParentAction && actions.length > 0 && (
  <div>
    <h3>Actions</h3>
    <ul>
      {actions.map(action => (
        <li key={action.id}>
          {action.description} {/* ✅ Ensure correct property name */}
        </li>
      ))}
    </ul>
  </div>
)}

{/* Show message if parent action is selected but has no actions */}
{selectedParentAction && actions.length === 0 && (
  <p> No actions found for this parent action. Try adding one!</p>
)}

      {/* 📌 Modal for Adding a New Library */}
      <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal">
        <h2>Add New Library</h2>
        <form onSubmit={handleAddLibrary}>
          <input 
            type="text" 
            placeholder="Library Name" 
            value={newLibraryName}
            onChange={(e) => setNewLibraryName(e.target.value)}
            required
          />
          <button type="submit">Create</button>
          <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
        </form>
      </Modal>
    </div>
  );

};

export default LibraryExplorer;
