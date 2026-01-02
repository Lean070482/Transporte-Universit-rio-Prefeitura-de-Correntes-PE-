// 1. CONFIGURAÇÃO DE ROTAS E MOTORISTAS
const rotas = {
    "Garanhuns": "José Carlos",
    "Caruaru": "Marcos Silva",
    "Palmares": "André Lima"
};

// 2. FUNÇÃO PARA CONVERTER IMAGEM EM TEXTO (BASE64)
const converterParaBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// 3. CONTROLE DE ABAS
function mostrarAba(id) {
    document.querySelectorAll('.aba').forEach(sec => {
        sec.style.display = 'none';
    });
    document.getElementById(id).style.display = 'block';

    if (id === 'aba-status') carregarStatus();
    if (id === 'aba-admin') carregarAdmin();
}

// Executa ao abrir a página
window.onload = function () {
    if (localStorage.getItem('adminLogado') === 'true') {
        mostrarAba('aba-admin');
    } else {
        mostrarAba('aba-aluno');
    }
};

// 4. CADASTRO DO ALUNO (ASSÍNCRONO PARA AS FOTOS)
async function cadastrarAluno() {
    const nome = document.getElementById('nome').value;
    const rg = document.getElementById('rg').value;
    const idade = document.getElementById('idade').value;
    const local = document.getElementById('local').value;
    const horario = document.getElementById('horario').value;
    const fotoInput = document.getElementById('foto');
    const comprovanteInput = document.getElementById('comprovante');

    if (!fotoInput.files[0] || !comprovanteInput.files[0]) {
        alert('Por favor, selecione a foto e o comprovante.');
        return;
    }

    try {
        let comprovanteURL = '';

if (comprovanteFile.type.startsWith('image/')) {
    comprovanteURL = await converterParaBase64(comprovanteFile);
} else {
    comprovanteURL = URL.createObjectURL(comprovanteFile);
}


        const aluno = {
    nome, rg, idade, local, horario,
    status: 'Em análise',
    motorista: '',
    fotoURL: fotoBase64,
    comprovanteURL: comprovanteURL
};


        localStorage.setItem('alunoCadastro', JSON.stringify(aluno));
        alert('Cadastro enviado com sucesso!');
        mostrarAba('aba-status');
        
    } catch (erro) {
        console.error(erro);
        alert('Erro ao processar as imagens.');
    }
}

// 5. STATUS DO ALUNO
function carregarStatus() {
    const dados = JSON.parse(localStorage.getItem('alunoCadastro'));
    const area = document.getElementById('statusConteudo');

    if (!dados) {
        area.innerHTML = '<p>Nenhum cadastro encontrado.</p>';
        return;
    }

    area.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <img src="${dados.fotoURL}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid #ccc;">
        </div>
        <p><strong>Nome:</strong> ${dados.nome}</p>
        <p><strong>Destino:</strong> ${dados.local} (${dados.horario})</p>
        <p><strong>Status:</strong> <span style="color:${dados.status === 'Aprovado' ? 'green' : 'orange'}">${dados.status}</span></p>
        <p><strong>Motorista:</strong> ${dados.motorista || 'Aguardando definição'}</p>
    `;
}

// 6. ÁREA ADMINISTRATIVA
function acessarAdmin() {
    if (localStorage.getItem('adminLogado') === 'true') {
        mostrarAba('aba-admin');
    } else {
        mostrarAba('aba-login-admin');
    }
}

function loginAdmin() {
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;

    if (user === 'admin' && pass === '1234') {
        localStorage.setItem('adminLogado', 'true');
        mostrarAba('aba-admin');
    } else {
        document.getElementById('loginErro').style.display = 'block';
    }
}

function logoutAdmin() {
    localStorage.removeItem('adminLogado');
    mostrarAba('aba-aluno');
}

// 7. PAINEL ADMIN - LISTAGEM E AÇÕES
function carregarAdmin() {
    const aluno = JSON.parse(localStorage.getItem('alunoCadastro'));
    const tabela = document.getElementById('listaAdmin');
    tabela.innerHTML = '';

    if (!aluno) {
        tabela.innerHTML = '<tr><td colspan="5">Nenhum aluno cadastrado</td></tr>';
        return;
    }

    tabela.innerHTML = `
        <tr>
            <td>
                <img src="${aluno.fotoURL}" style="width:50px; height:50px; border-radius:50%; object-fit:cover;"><br>
                ${aluno.nome}
            </td>
            <td>${aluno.local}</td>
            <td>${aluno.status}</td>
            <td>
                <a href="${aluno.comprovanteURL}" target="_blank">📄 Ver Doc</a>
            </td>
            <td>
                <button onclick="aprovar()" style="background:green; color:white;">Aprovar</button>
                <button onclick="recusar()" style="background:red; color:white;">Recusar</button>
            </td>
        </tr>
    `;
}

function aprovar() {
    let aluno = JSON.parse(localStorage.getItem('alunoCadastro'));
    if(aluno) {
        aluno.status = "Aprovado";
        // Busca o motorista no objeto 'rotas' baseado no local digitado
        aluno.motorista = rotas[aluno.local] || "Motorista não encontrado";
        localStorage.setItem('alunoCadastro', JSON.stringify(aluno));
        carregarAdmin();
        alert("Aluno aprovado com sucesso!");
    }
}

function recusar() {
    let aluno = JSON.parse(localStorage.getItem('alunoCadastro'));
    if(aluno) {
        aluno.status = "Recusado";
        aluno.motorista = "-";
        localStorage.setItem('alunoCadastro', JSON.stringify(aluno));
        carregarAdmin();
        alert("Cadastro recusado.");
    }
}
document.getElementById('formAluno').addEventListener('submit', function (event) {
    event.preventDefault(); // 👈 ISSO É O QUE ESTAVA FALTANDO

    const aluno = {
        nome: document.getElementById('nome').value,
        rg: document.getElementById('rg').value,
        idade: document.getElementById('idade').value,
        local: document.getElementById('local').value,
        horario: document.getElementById('horario').value,
        status: 'Em análise',
        motorista: '',
        rota: '',
        fotoURL: URL.createObjectURL(document.getElementById('foto').files[0]),
        comprovanteURL: URL.createObjectURL(document.getElementById('comprovante').files[0])
    };

    localStorage.setItem('alunoCadastro', JSON.stringify(aluno));

    alert('Cadastro enviado com sucesso!');
    mostrarAba('aba-status');
});
async function uploadArquivo(file, pasta) {
  const ref = storage.ref(`${pasta}/${Date.now()}_${file.name}`);
  await ref.put(file);
  return await ref.getDownloadURL();
}
async function cadastrarAluno() {
  const nome = nomeInput.value;
  const rg = rgInput.value;
  const local = localInput.value;

  const foto = document.getElementById('foto').files[0];
  const pdf = document.getElementById('comprovante').files[0];

  if (!foto || !pdf) {
    alert("Envie foto e comprovante");
    return;
  }

  const fotoURL = await uploadArquivo(foto, "fotos");
  const comprovanteURL = await uploadArquivo(pdf, "comprovantes");

  await db.collection("alunos").add({
    nome,
    rg,
    local,
    fotoURL,
    comprovanteURL,
    status: "Em análise",
    motorista: ""
  });

  alert("Cadastro enviado!");
}
