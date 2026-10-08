document.addEventListener('DOMContentLoaded', function () {

    // Alternância entre telas de login e cadastro
    const formLogin = document.getElementById('formLogin');
    const formCadastro = document.getElementById('formCadastro');
    const linkIrCadastro = document.getElementById('linkIrCadastro');
    const linkIrLogin = document.getElementById('linkIrLogin');

    if (linkIrCadastro && linkIrLogin) {
        linkIrCadastro.addEventListener('click', function (e) {
            e.preventDefault();
            formLogin.style.display = 'none';
            formCadastro.style.display = 'flex';
        });

        linkIrLogin.addEventListener('click', function (e) {
            e.preventDefault();
            formCadastro.style.display = 'none';
            formLogin.style.display = 'flex';
        });
    }

    // 1. Processo de Cadastro de Aluno no Supabase
    if (formCadastro) {
        formCadastro.addEventListener('submit', async function (e) {
            e.preventDefault();

            const btn = document.getElementById('btnCadastrar');
            btn.disabled = true;
            btn.textContent = 'Gravando no banco...';

            const nome = document.getElementById('cadNome').value.trim();
            const usuario = document.getElementById('cadUsuario').value.trim();
            const senha = document.getElementById('cadSenha').value;
            const cpf = document.getElementById('cadCpf').value.trim();
            const telefone = document.getElementById('cadTelefone').value.trim();
            const dataNascimento = document.getElementById('cadDataNascimento').value;
            const endereco = document.getElementById('cadEndereco').value.trim();

            try {
                // Insere diretamente na tabela alunos
                const { data, error } = await supabaseClient
                    .from('alunos')
                    .insert([
                        {
                            nome: nome,
                            usuario: usuario,
                            senha: senha,
                            cpf: cpf,
                            telefone: telefone,
                            data_nascimento: dataNascimento,
                            endereco: endereco
                        }
                    ])
                    .select();

                if (error) {
                    alert('Erro retornado pelo banco: ' + error.message);
                    btn.disabled = false;
                    btn.textContent = 'Cadastrar';
                    return;
                }

                alert('Cadastro concluído com sucesso!');

                formCadastro.reset();
                formCadastro.style.display = 'none';
                formLogin.style.display = 'flex';
                document.getElementById('loginUsuario').value = usuario;

            } catch (err) {
                alert('Falha na comunicação: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Cadastrar';
            }
        });
    }

    // 2. Processo de Login no Supabase
    if (formLogin) {
        formLogin.addEventListener('submit', async function (e) {
            e.preventDefault();

            const identificador = document.getElementById('loginUsuario').value.trim();
            const senha = document.getElementById('loginSenha').value;
            const btnEntrar = document.getElementById('btnEntrar');

            btnEntrar.disabled = true;
            btnEntrar.textContent = 'Entrando...';

            try {
                const { data, error } = await supabaseClient
                    .from('alunos')
                    .select('*')
                    .or(`usuario.eq.${identificador},cpf.eq.${identificador}`)
                    .eq('senha', senha)
                    .maybeSingle();

                if (error) {
                    alert('Erro na consulta: ' + error.message);
                    btnEntrar.disabled = false;
                    btnEntrar.textContent = 'Entrar';
                    return;
                }

                if (!data) {
                    alert('Usuário/CPF ou senha incorretos.');
                    btnEntrar.disabled = false;
                    btnEntrar.textContent = 'Entrar';
                    return;
                }

                // Salva o usuario na sessao
                sessionStorage.setItem('alunoId', data.id_aluno);
                sessionStorage.setItem('alunoNome', data.nome);
                window.location.href = 'home.html';

            } catch (err) {
                alert('Erro de conexão: ' + err.message);
                btnEntrar.disabled = false;
                btnEntrar.textContent = 'Entrar';
            }
        });
    }

    // 3. Home - Boas-vindas e Logout
    const mensagemBoasVindas = document.getElementById('mensagemBoasVindas');
    const btnVerTreinos = document.getElementById('btnVerTreinos');
    const btnSair = document.getElementById('btnSair');

    if (btnVerTreinos || mensagemBoasVindas) {
        const idAluno = sessionStorage.getItem('alunoId');
        const nomeAluno = sessionStorage.getItem('alunoNome');

        if (!idAluno && window.location.pathname.includes('home.html')) {
            window.location.href = 'index.html';
            return;
        }

        if (nomeAluno && mensagemBoasVindas) {
            mensagemBoasVindas.textContent = 'Bem vindo, ' + nomeAluno + '!';
        }

        if (btnVerTreinos) {
            btnVerTreinos.addEventListener('click', function () {
                window.location.href = 'treinos.html';
            });
        }

        if (btnSair) {
            btnSair.addEventListener('click', function () {
                sessionStorage.clear();
                window.location.href = 'index.html';
            });
        }
    }

    // 4. Treinos
    const btnTreinoA = document.getElementById('btnTreinoA');
    if (btnTreinoA) {
        const treinos = {
            A: {
                titulo: 'Treino A: Peito e Tríceps',
                exercicios: ['Supino reto - 4x10', 'Voador - 3x12', 'Crucifixo inclinado - 3x15', 'Tríceps corda - 4x10', 'Tríceps Francês - 4x10']
            },
            B: {
                titulo: 'Treino B: Costas e Bíceps',
                exercicios: ['Puxada Frontal - 4x10', 'Remada Curvada - 4x10', 'Remada Baixa - 3x12', 'Rosca Direta - 4x10', 'Rosca Martelo - 3x12']
            },
            C: {
                titulo: 'Treino C: Pernas e Ombros',
                exercicios: ['Agachamento Livre - 4x10', 'Leg Press - 4x10', 'Cadeira Extensora - 3x12', 'Desenvolvimento halteres - 4x10', 'Elevação Lateral - 3x12']
            }
        };

        function exibirTreino(tipo) {
            const dados = treinos[tipo];
            document.getElementById('tituloTreino').textContent = dados.titulo;
            const lista = document.getElementById('listaExercicios');
            lista.innerHTML = '';
            dados.exercicios.forEach(function (exercicio) {
                const li = document.createElement('li');
                li.textContent = exercicio;
                lista.appendChild(li);
            });
        }

        btnTreinoA.addEventListener('click', () => exibirTreino('A'));
        const btnB = document.getElementById('btnTreinoB');
        if (btnB) btnB.addEventListener('click', () => exibirTreino('B'));
        const btnC = document.getElementById('btnTreinoC');
        if (btnC) btnC.addEventListener('click', () => exibirTreino('C'));

        const btnVoltar = document.getElementById('btnVoltar');
        if (btnVoltar) {
            btnVoltar.addEventListener('click', () => window.location.href = 'home.html');
        }
    }
});