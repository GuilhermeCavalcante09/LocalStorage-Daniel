const studentForm = document.getElementById('student-form');
const studentIdInput = document.getElementById('student-id');
const nameInput = document.getElementById('name');
const raInput = document.getElementById('ra');
const ageInput = document.getElementById('age');
const classInput = document.getElementById('class');
const courseInput = document.getElementById('course');
const emailInput = document.getElementById('email');
const btnCancel = document.getElementById('btn-cancel');
const btnSave = document.getElementById('btn-save');
const formTitle = document.getElementById('form-title');
const studentsList = document.getElementById('students-list');
const searchInput = document.getElementById('search-input');
const messageBox = document.getElementById('message');

const btnAdminAccess = document.getElementById('btn-admin-access');
const passwordModal = document.getElementById('password-modal');
const adminPasswordInput = document.getElementById('admin-password');
const btnConfirmPassword = document.getElementById('btn-confirm-password');
const btnCloseModal = document.getElementById('btn-close-modal');

let students = JSON.parse(localStorage.getItem('students')) || [];
let isAdmin = false;
const ADMIN_PASSWORD = '13022009';

function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = `message ${type}`;
    messageBox.classList.remove('hidden');
    setTimeout(() => {
        messageBox.classList.add('hidden');
    }, 3000);
}

function saveToLocalStorage() {
    localStorage.setItem('students', JSON.stringify(students));
}

function renderStudents(filteredStudents = null) {
    const list = filteredStudents || students;
    studentsList.innerHTML = '';

    const adminHeaders = document.querySelectorAll('.admin-only');
    adminHeaders.forEach(el => {
        if (isAdmin) el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    list.forEach((student, index) => {
        const row = document.createElement('tr');
        let actionsHtml = '';

        if (isAdmin) {
            actionsHtml = `
                <td class="actions">
                    <button class="btn-edit" onclick="editStudent(${index})">Editar</button>
                    <button class="btn-delete" onclick="deleteStudent(${index})">Excluir</button>
                </td>
            `;
        }

        row.innerHTML = `
            <td>${student.ra}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.class}</td>
            <td>${student.course}</td>
            <td>${student.email}</td>
            ${actionsHtml}
        `;
        studentsList.appendChild(row);
    });
}

function clearForm() {
    studentForm.reset();
    studentIdInput.value = '';
    formTitle.textContent = 'Cadastrar Novo Aluno';
    btnSave.textContent = 'Salvar';
    btnCancel.classList.add('hidden');
}

studentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const studentData = {
        name: nameInput.value.trim(),
        ra: raInput.value.trim(),
        age: ageInput.value,
        class: classInput.value.trim(),
        course: courseInput.value.trim(),
        email: emailInput.value.trim()
    };

    if (studentIdInput.value === '') {
        const raExists = students.some(s => s.ra === studentData.ra);
        if (raExists) {
            showMessage('Erro: Este RA já está cadastrado.', 'error');
            return;
        }
        students.push(studentData);
        showMessage('Aluno cadastrado com sucesso!', 'success');
    } else {
        if (!isAdmin) {
            showMessage('Erro: Acesso administrativo necessário para editar.', 'error');
            return;
        }
        const index = studentIdInput.value;
        const raExists = students.some((s, i) => s.ra === studentData.ra && i != index);
        if (raExists) {
            showMessage('Erro: Este RA já está sendo usado por outro aluno.', 'error');
            return;
        }
        students[index] = studentData;
        showMessage('Dados do aluno atualizados com sucesso!', 'success');
    }

    saveToLocalStorage();
    renderStudents();
    clearForm();
});

window.editStudent = function(index) {
    if (!isAdmin) return;
    const student = students[index];
    studentIdInput.value = index;
    nameInput.value = student.name;
    raInput.value = student.ra;
    ageInput.value = student.age;
    classInput.value = student.class;
    courseInput.value = student.course;
    emailInput.value = student.email;

    formTitle.textContent = 'Editar Aluno';
    btnSave.textContent = 'Atualizar';
    btnCancel.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteStudent = function(index) {
    if (!isAdmin) return;
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        students.splice(index, 1);
        saveToLocalStorage();
        renderStudents();
        showMessage('Aluno excluído com sucesso!', 'success');
    }
};

btnCancel.addEventListener('click', clearForm);

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = students.filter(student =>
        student.name.toLowerCase().includes(term) ||
        student.ra.toLowerCase().includes(term)
    );
    renderStudents(filtered);
});

// Admin Access Logic
btnAdminAccess.addEventListener('click', () => {
    if (isAdmin) {
        isAdmin = false;
        btnAdminAccess.textContent = 'Acesso Administrativo';
        btnAdminAccess.style.backgroundColor = 'var(--secondary-color)';
        renderStudents();
        clearForm();
        showMessage('Saída do modo administrativo.', 'success');
    } else {
        passwordModal.classList.remove('hidden');
        adminPasswordInput.focus();
    }
});

btnCloseModal.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
    adminPasswordInput.value = '';
});

btnConfirmPassword.addEventListener('click', () => {
    if (adminPasswordInput.value === ADMIN_PASSWORD) {
        isAdmin = true;
        btnAdminAccess.textContent = 'Sair do Modo Admin';
        btnAdminAccess.style.backgroundColor = 'var(--error-color)';
        passwordModal.classList.add('hidden');
        adminPasswordInput.value = '';
        renderStudents();
        showMessage('Acesso administrativo concedido!', 'success');
    } else {
        showMessage('Senha incorreta!', 'error');
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
});

adminPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnConfirmPassword.click();
});

renderStudents();