import { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Table, Form, Pagination, Modal } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import editsvg from "./edit.svg";
import deletesvg from "./delete.svg";
import deletewhite from "./deletewhite.svg";
import leftarrows from "./double-arrow-left-icon.svg";
import rightarrows from "./double-arrow-right-icon.svg";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUserData, setEditedUserData] = useState({
    id: null,
    name: "",
    email: "",
    role: "",
  });


  const performSearch = () => {
    const result = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(result);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      performSearch(); // Trigger search when Enter key is pressed
    }
  };

  useEffect(() => {
    // setFilteredData(users); // Set filteredData to users initially
    performSearch();
  }, [users]);

  const handleEditClick = (user) => {
    setEditedUserData(user);
    setShowEditModal(true);
  };

  const itemsPerPage = 10;

  const updatePage = (page) => {
    setCurrentPage(page);
    setSelectedRows([]); // Reset selected rows when changing pages
  };



  const getPaginList = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
    // return users.slice(startIndex, endIndex);
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === getPaginList().length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...getPaginList().map((user) => user.id)]);
    }
  };

  const toggleSelectRow = (userId) => {
    if (selectedRows.includes(userId)) {
      setSelectedRows(selectedRows.filter((id) => id !== userId));
    } else {
      setSelectedRows([...selectedRows, userId]);
    }
  };

  const deleteUser = (id) => {
    const newUsers = users.filter((user) => user.id !== id);
    setUsers(newUsers);
  };

  const deleteSelectedUsers = () => {
    const updatedUsers = users.filter(
      (user) => !selectedRows.includes(user.id)
    );

    setUsers(updatedUsers);
    setSelectedRows([]); // Clear the selectedRows state
    // setSearchTerm("");
  };

  const handleEditSave = () => {
    const editedUserIndex = users.findIndex(
      (user) => user.id === editedUserData.id
    );

    const updatedUsers = [...users];
    updatedUsers[editedUserIndex] = editedUserData;

    setUsers(updatedUsers);
    setShowEditModal(false); // Close the modal
  };

  // const totalPages = Math.ceil(users.length / itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  useEffect(() => {
    // Fetch data from an API
    fetch(
      "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
        console.log(users);
      });
  }, []); // Empty dependency array, runs only once

  if (!users) return <div>Loading...</div>;

  return (
    <div className="App px-5 pt-2">
      <header className="display-6 py-2">User Admin Table</header>
      {/* className="w-auto" */}
      <Form.Group controlId="search" className="d-flex justify-content-evenly">
        <InputGroup className="pe-2">
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            className="search-icon"
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to the first page when the search term changes
            }}
          />
          <InputGroup.Text style={{cursor: "pointer"}} className="search-icon" onClick={performSearch}>Search</InputGroup.Text>
        </InputGroup>
        <Button
          variant="danger"
          onClick={deleteSelectedUsers}
          disabled={selectedRows.length === 0}
          className=""
        >
          <img src={deletewhite} alt="delete all users" />
        </Button>
      </Form.Group>

      <Table bordered hover size="sm" className="mt-2">
        <thead>
          <tr>
            <th>
              <InputGroup className="d-flex align-items-center justify-content-center">
              <InputGroup.Checkbox
                aria-label="Checkbox for following text input"
                onChange={toggleSelectAll}
                checked={selectedRows.length === getPaginList().length}
              />
              </InputGroup>
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {getPaginList().map((user) => {
            return (
              <tr key={user.id}>
                <td>
                  <InputGroup className="d-flex align-items-center justify-content-center">
                  <InputGroup.Checkbox 
                    aria-label="Checkbox for following text input"
                    onChange={() => toggleSelectRow(user.id)}
                    checked={selectedRows.includes(user.id)}
                  />
                  </InputGroup>
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <Button
                    variant="light"
                    className="edit"
                    onClick={() => handleEditClick(user)}
                  >
                    <img src={editsvg} alt="edit" />
                  </Button>{" "}
                  <Button
                    variant="light"
                    className="delete"
                    onClick={() => deleteUser(user.id)}
                  >
                    <img src={deletesvg} alt="delete" />
                  </Button>{" "}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
      <p className="text-muted">{selectedRows.length} of {filteredData.length} row(s) selected.</p>

      <p className="fw-bold">Page {currentPage} of {totalPages}</p>
      {/* Pagination controls */}
      <Pagination>
        <Button
          variant="light"
          className="first-page me-2"
          onClick={() => updatePage(1)}
        >
          First Page
        </Button>
        <Pagination.Prev
          onClick={() => updatePage(currentPage - 1)}
          disabled={currentPage === 1}
        />

        {/* Render page buttons */}
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={index + 1 === currentPage}
            onClick={() => updatePage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          onClick={() => updatePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <Button
          variant="light"
          className="last-page ms-2"
          onClick={() => updatePage(totalPages)}
        >
          Last Page
        </Button>
      </Pagination>
      </div>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="editName">
              <InputGroup className="mb-3">
                <InputGroup.Text>Name</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={editedUserData.name}
                  onChange={(e) =>
                    setEditedUserData({
                      ...editedUserData,
                      name: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="editEmail">
              <InputGroup className="mb-3">
                <InputGroup.Text>Email</InputGroup.Text>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={editedUserData.email}
                  onChange={(e) =>
                    setEditedUserData({
                      ...editedUserData,
                      email: e.target.value,
                    })
                  }
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="editRole">
              <InputGroup className="mb-3">
                <InputGroup.Text>Role</InputGroup.Text>

                <Form.Control
                  as="select"
                  value={editedUserData.role}
                  onChange={(e) =>
                    setEditedUserData({
                      ...editedUserData,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                  <option value="Admin">Moderator</option>
                  <option value="Admin">Guest</option>
                </Form.Control>
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className="close" onClick={() => setShowEditModal(false)}>
            Close
          </Button>
          <Button variant="primary" className="save" onClick={handleEditSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
