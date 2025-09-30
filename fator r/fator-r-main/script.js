// ==============================================
// FATOR R PRO - JAVASCRIPT COMPLETO
// ==============================================

// Configuração Global
const FatorRApp = {
    // Estados da aplicação
    state: {
        currentStep: 1,
        calculatorData: {
            companyName: '',
            cnpj: '',
            activity: '',
            annualRevenue: 0,
            proLabore: 0,
            employees: 0,
            averageSalary: 0,
            includes13th: true,
            includesVacation: true,
            socialCharges: 0.2 // 20% padrão
        },
        simulatorData: {
            revenue: 1200000,
            prolabore: 15000,
            employees: 5,
            avgSalary: 3000
        },
        results: {
            factorR: 0,
            classification: '',
            monthlyTax: 0,
            annualTax: 0,
            savings: 0
        }
    },

    // Tabelas do Simples Nacional 2025
    tables: {
        anexoIII: [
            { min: 0, max: 180000, aliquot: 0.06, deduction: 0 },
            { min: 180000.01, max: 360000, aliquot: 0.112, deduction: 9360 },
            { min: 360000.01, max: 720000, aliquot: 0.135, deduction: 17640 },
            { min: 720000.01, max: 1800000, aliquot: 0.16, deduction: 35640 },
            { min: 1800000.01, max: 3600000, aliquot: 0.21, deduction: 125640 },
            { min: 3600000.01, max: 4800000, aliquot: 0.33, deduction: 648000 }
        ],
        anexoV: [
            { min: 0, max: 180000, aliquot: 0.155, deduction: 0 },
            { min: 180000.01, max: 360000, aliquot: 0.18, deduction: 4500 },
            { min: 360000.01, max: 720000, aliquot: 0.195, deduction: 9900 },
            { min: 720000.01, max: 1800000, aliquot: 0.205, deduction: 17100 },
            { min: 1800000.01, max: 3600000, aliquot: 0.23, deduction: 62100 },
            { min: 3600000.01, max: 4800000, aliquot: 0.305, deduction: 540000 }
        ]
    }
};

// ==============================================
// INICIALIZAÇÃO
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupCalculator();
    setupSimulator();
    setupEventListeners();
    animateOnScroll();
    updateProgressBar();
}

// ==============================================
// NAVEGAÇÃO E SCROLL
// ==============================================

function setupNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Scroll navbar effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link
        updateActiveNavLink();
    });

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // Close mobile menu if open
            navMenu.classList.remove('active');
        });
    });

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80; // Height of fixed navbar
        const sectionTop = section.offsetTop - offset;
        
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.pageYOffset >= sectionTop && 
            window.pageYOffset < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === current) {
            link.classList.add('active');
        }
    });
}

// ==============================================
// CALCULADORA - SETUP E CONTROLES
// ==============================================

function setupCalculator() {
    // Setup option cards
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selected from siblings
            optionCards.forEach(c => c.classList.remove('selected'));
            // Add selected to clicked card
            card.classList.add('selected');
            // Store the value
            FatorRApp.state.calculatorData.activity = card.dataset.value;
            updateProgressBar();
        });
    });

    // Setup form inputs
    setupFormInputs();
}

function setupFormInputs() {
    // Company name input
    const companyNameInput = document.getElementById('companyName');
    if (companyNameInput) {
        companyNameInput.addEventListener('input', (e) => {
            FatorRApp.state.calculatorData.companyName = e.target.value;
        });
    }

    // CNPJ input with mask
    const cnpjInput = document.getElementById('cnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            e.target.value = maskCNPJ(e.target.value);
            FatorRApp.state.calculatorData.cnpj = e.target.value;
        });
    }
}

function maskCNPJ(value) {
    value = value.replace(/\D/g, '');
    value = value.replace(/^(\d{2})(\d)/, '$1.$2');
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
    value = value.replace(/(\d{4})(\d)/, '$1-$2');
    return value;
}

// ==============================================
// CALCULADORA - NAVEGAÇÃO ENTRE ETAPAS
// ==============================================

function nextStep(step) {
    if (validateCurrentStep()) {
        FatorRApp.state.currentStep = step;
        showStep(step);
        updateProgressBar();
        updateStepIndicators();
    }
}

function previousStep() {
    if (FatorRApp.state.currentStep > 1) {
        FatorRApp.state.currentStep--;
        showStep(FatorRApp.state.currentStep);
        updateProgressBar();
        updateStepIndicators();
    }
}

function showStep(step) {
    const calcCard = document.querySelector('.calc-card');
    
    // Animate transition
    calcCard.style.opacity = '0';
    
    setTimeout(() => {
        updateStepContent(step);
        calcCard.style.opacity = '1';
    }, 300);
}

function updateStepContent(step) {
    const calcHeader = document.querySelector('.calc-header h3');
    const calcHeaderDesc = document.querySelector('.calc-header p');
    const calcBody = document.querySelector('.calc-body');
    const calcFooter = document.querySelector('.calc-footer');
    
    switch(step) {
        case 1:
            calcHeader.textContent = 'Dados da Empresa';
            calcHeaderDesc.textContent = 'Informe os dados básicos da sua empresa para começarmos';
            calcBody.innerHTML = getStep1HTML();
            calcFooter.innerHTML = getStep1FooterHTML();
            break;
            
        case 2:
            calcHeader.textContent = 'Faturamento';
            calcHeaderDesc.textContent = 'Informe o faturamento dos últimos 12 meses';
            calcBody.innerHTML = getStep2HTML();
            calcFooter.innerHTML = getStep2FooterHTML();
            break;
            
        case 3:
            calcHeader.textContent = 'Folha de Pagamento';
            calcHeaderDesc.textContent = 'Dados sobre salários e funcionários';
            calcBody.innerHTML = getStep3HTML();
            calcFooter.innerHTML = getStep3FooterHTML();
            break;
            
        case 4:
            calcHeader.textContent = 'Benefícios e Adicionais';
            calcHeaderDesc.textContent = 'Informações sobre 13º salário, férias e encargos';
            calcBody.innerHTML = getStep4HTML();
            calcFooter.innerHTML = getStep4FooterHTML();
            break;
            
        case 5:
            calcHeader.textContent = 'Resultado do Cálculo';
            calcHeaderDesc.textContent = 'Análise completa do Fator R da sua empresa';
            calcBody.innerHTML = getStep5HTML();
            calcFooter.innerHTML = getStep5FooterHTML();
            calculateFatorR();
            break;
    }
    
    // Re-attach event listeners for new elements
    if (step === 1) {
        setupFormInputs();
        setupActivityCards();
    } else if (step === 2) {
        setupRevenueInput();
    } else if (step === 3) {
        setupPayrollInputs();
    } else if (step === 4) {
        setupBenefitsInputs();
    } else if (step === 5) {
        displayResults();
    }
}

// ==============================================
// CONTEÚDO HTML DAS ETAPAS
// ==============================================

function getStep1HTML() {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label for="companyName">Nome da Empresa</label>
                <input type="text" id="companyName" placeholder="Ex: Soluções Tributárias Ltda" 
                       value="${FatorRApp.state.calculatorData.companyName}">
                <div class="form-hint">Opcional - para identificação nos relatórios</div>
            </div>
            
            <div class="form-group">
                <label for="cnpj">CNPJ</label>
                <input type="text" id="cnpj" placeholder="00.000.000/0000-00" 
                       value="${FatorRApp.state.calculatorData.cnpj}">
                <div class="form-hint">Opcional - para documentos oficiais</div>
            </div>
        </div>
        
        <div class="form-group">
            <label>Atividade Principal da Empresa</label>
            <div class="option-cards">
                <div class="option-card ${FatorRApp.state.calculatorData.activity === 'servicos' ? 'selected' : ''}" 
                     data-value="servicos">
                    <div class="option-icon">
                        <i class="fas fa-laptop-code"></i>
                    </div>
                    <div class="option-content">
                        <h4>Prestação de Serviços</h4>
                        <p>Consultoria, TI, Marketing, Design e outros serviços</p>
                    </div>
                    <div class="option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                
                <div class="option-card ${FatorRApp.state.calculatorData.activity === 'comercio' ? 'selected' : ''}" 
                     data-value="comercio">
                    <div class="option-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="option-content">
                        <h4>Comércio</h4>
                        <p>Varejo, atacado, e-commerce e distribuição</p>
                    </div>
                    <div class="option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                
                <div class="option-card ${FatorRApp.state.calculatorData.activity === 'industria' ? 'selected' : ''}" 
                     data-value="industria">
                    <div class="option-icon">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="option-content">
                        <h4>Indústria</h4>
                        <p>Produção, manufatura e transformação</p>
                    </div>
                    <div class="option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
                
                <div class="option-card ${FatorRApp.state.calculatorData.activity === 'misto' ? 'selected' : ''}" 
                     data-value="misto">
                    <div class="option-icon">
                        <i class="fas fa-blender-phone"></i>
                    </div>
                    <div class="option-content">
                        <h4>Atividade Mista</h4>
                        <p>Combinação de serviços, comércio e indústria</p>
                    </div>
                    <div class="option-check">
                        <i class="fas fa-check"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getStep1FooterHTML() {
    return `
        <button class="btn btn-secondary" onclick="cancelCalculator()">
            <i class="fas fa-times"></i>
            Cancelar
        </button>
        <button class="btn btn-primary" onclick="nextStep(2)">
            Continuar
            <i class="fas fa-arrow-right"></i>
        </button>
    `;
}

function getStep2HTML() {
    return `
        <div class="form-group">
            <label for="annualRevenue">Receita Bruta dos Últimos 12 Meses (RBT12)</label>
            <div class="revenue-input-wrapper">
                <span class="currency-prefix">R$</span>
                <input type="text" id="annualRevenue" placeholder="0,00" 
                       value="${formatCurrency(FatorRApp.state.calculatorData.annualRevenue)}">
            </div>
            <div class="form-hint">Informe o total de receita bruta acumulada nos últimos 12 meses</div>
        </div>
        
        <div class="revenue-shortcuts">
            <p>Atalhos rápidos:</p>
            <div class="shortcut-buttons">
                <button class="shortcut-btn" onclick="setRevenue(180000)">R$ 180 mil</button>
                <button class="shortcut-btn" onclick="setRevenue(360000)">R$ 360 mil</button>
                <button class="shortcut-btn" onclick="setRevenue(720000)">R$ 720 mil</button>
                <button class="shortcut-btn" onclick="setRevenue(1800000)">R$ 1,8 mi</button>
                <button class="shortcut-btn" onclick="setRevenue(3600000)">R$ 3,6 mi</button>
            </div>
        </div>
        
        <div class="info-card">
            <i class="fas fa-info-circle"></i>
            <div class="info-content">
                <h4>O que incluir na Receita Bruta?</h4>
                <ul>
                    <li>Vendas de produtos</li>
                    <li>Prestação de serviços</li>
                    <li>Receitas financeiras operacionais</li>
                    <li>Outras receitas operacionais</li>
                </ul>
            </div>
        </div>
    `;
}

function getStep2FooterHTML() {
    return `
        <button class="btn btn-secondary" onclick="previousStep()">
            <i class="fas fa-arrow-left"></i>
            Voltar
        </button>
        <button class="btn btn-primary" onclick="nextStep(3)">
            Continuar
            <i class="fas fa-arrow-right"></i>
        </button>
    `;
}

function getStep3HTML() {
    return `
        <div class="form-grid">
            <div class="form-group">
                <label for="proLabore">Pró-Labore Mensal dos Sócios</label>
                <div class="currency-input">
                    <span class="currency-prefix">R$</span>
                    <input type="text" id="proLabore" placeholder="0,00" 
                           value="${formatCurrency(FatorRApp.state.calculatorData.proLabore)}">
                </div>
                <div class="form-hint">Soma do pró-labore de todos os sócios</div>
            </div>
            
            <div class="form-group">
                <label for="employees">Número de Funcionários CLT</label>
                <input type="number" id="employees" placeholder="0" min="0" 
                       value="${FatorRApp.state.calculatorData.employees}">
                <div class="form-hint">Apenas funcionários com carteira assinada</div>
            </div>
        </div>
        
        <div class="form-group">
            <label for="averageSalary">Salário Médio dos Funcionários</label>
            <div class="currency-input">
                <span class="currency-prefix">R$</span>
                <input type="text" id="averageSalary" placeholder="0,00" 
                       value="${formatCurrency(FatorRApp.state.calculatorData.averageSalary)}">
            </div>
            <div class="form-hint">Média salarial sem encargos</div>
        </div>
        
        <div class="payroll-summary">
            <h4>Resumo da Folha Mensal</h4>
            <div class="summary-item">
                <span>Pró-labore:</span>
                <span id="summaryProLabore">R$ ${formatCurrency(FatorRApp.state.calculatorData.proLabore)}</span>
            </div>
            <div class="summary-item">
                <span>Salários (${FatorRApp.state.calculatorData.employees} func.):</span>
                <span id="summarySalaries">R$ ${formatCurrency(FatorRApp.state.calculatorData.employees * FatorRApp.state.calculatorData.averageSalary)}</span>
            </div>
            <div class="summary-item total">
                <span>Total Mensal:</span>
                <span id="summaryTotal">R$ ${formatCurrency(FatorRApp.state.calculatorData.proLabore + (FatorRApp.state.calculatorData.employees * FatorRApp.state.calculatorData.averageSalary))}</span>
            </div>
        </div>
    `;
}

function getStep3FooterHTML() {
    return `
        <button class="btn btn-secondary" onclick="previousStep()">
            <i class="fas fa-arrow-left"></i>
            Voltar
        </button>
        <button class="btn btn-primary" onclick="nextStep(4)">
            Continuar
            <i class="fas fa-arrow-right"></i>
        </button>
    `;
}

function getStep4HTML() {
    return `
        <div class="benefits-options">
            <div class="benefit-card">
                <div class="benefit-header">
                    <div class="benefit-icon">
                        <i class="fas fa-gift"></i>
                    </div>
                    <div class="benefit-info">
                        <h4>13º Salário</h4>
                        <p>Incluir no cálculo do Fator R</p>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="includes13th" 
                           ${FatorRApp.state.calculatorData.includes13th ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
            
            <div class="benefit-card">
                <div class="benefit-header">
                    <div class="benefit-icon">
                        <i class="fas fa-umbrella-beach"></i>
                    </div>
                    <div class="benefit-info">
                        <h4>1/3 de Férias</h4>
                        <p>Incluir adicional de férias</p>
                    </div>
                </div>
                <label class="switch">
                    <input type="checkbox" id="includesVacation" 
                           ${FatorRApp.state.calculatorData.includesVacation ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
            </div>
        </div>
        
        <div class="form-group">
            <label for="socialCharges">Percentual de Encargos Sociais</label>
            <div class="percentage-input">
                <input type="range" id="socialCharges" min="0" max="50" step="1" 
                       value="${FatorRApp.state.calculatorData.socialCharges * 100}">
                <span class="percentage-value">${(FatorRApp.state.calculatorData.socialCharges * 100).toFixed(0)}%</span>
            </div>
            <div class="form-hint">FGTS, INSS patronal e outros encargos (padrão: 20%)</div>
        </div>
        
        <div class="charges-breakdown">
            <h4>Composição dos Encargos</h4>
            <div class="charge-item">
                <span>INSS Patronal:</span>
                <span>Incluído</span>
            </div>
            <div class="charge-item">
                <span>FGTS:</span>
                <span>8%</span>
            </div>
            <div class="charge-item">
                <span>Outros encargos:</span>
                <span>Variável</span>
            </div>
        </div>
    `;
}

function getStep4FooterHTML() {
    return `
        <button class="btn btn-secondary" onclick="previousStep()">
            <i class="fas fa-arrow-left"></i>
            Voltar
        </button>
        <button class="btn btn-primary" onclick="nextStep(5)">
            Calcular Fator R
            <i class="fas fa-calculator"></i>
        </button>
    `;
}

function getStep5HTML() {
    return `
        <div class="result-container">
            <div class="main-result ${FatorRApp.state.results.classification === 'Anexo III' ? 'success' : 'warning'}">
                <div class="result-icon">
                    <i class="fas ${FatorRApp.state.results.classification === 'Anexo III' ? 'fa-trophy' : 'fa-exclamation-triangle'}"></i>
                </div>
                <div class="result-info">
                    <h3>Fator R Calculado</h3>
                    <div class="factor-value">${FatorRApp.state.results.factorR.toFixed(2)}%</div>
                    <p class="classification">Classificação: <strong>${FatorRApp.state.results.classification}</strong></p>
                </div>
            </div>
            
            <div class="result-details">
                <div class="detail-card">
                    <i class="fas fa-calendar-alt"></i>
                    <div class="detail-info">
                        <span class="detail-label">Imposto Mensal</span>
                        <span class="detail-value">R$ ${formatCurrency(FatorRApp.state.results.monthlyTax)}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <i class="fas fa-chart-line"></i>
                    <div class="detail-info">
                        <span class="detail-label">Imposto Anual</span>
                        <span class="detail-value">R$ ${formatCurrency(FatorRApp.state.results.annualTax)}</span>
                    </div>
                </div>
                
                <div class="detail-card highlight">
                    <i class="fas fa-piggy-bank"></i>
                    <div class="detail-info">
                        <span class="detail-label">Economia Anual</span>
                        <span class="detail-value">R$ ${formatCurrency(FatorRApp.state.results.savings)}</span>
                    </div>
                </div>
            </div>
            
            <div class="calculation-breakdown">
                <h4>Memória de Cálculo</h4>
                <table class="breakdown-table">
                    <tr>
                        <td>Receita Bruta (RBT12):</td>
                        <td>R$ ${formatCurrency(FatorRApp.state.calculatorData.annualRevenue)}</td>
                    </tr>
                    <tr>
                        <td>Folha de Pagamento Total:</td>
                        <td>R$ ${formatCurrency(calculateTotalPayroll())}</td>
                    </tr>
                    <tr>
                        <td>Fator R (FP ÷ RBT12):</td>
                        <td>${FatorRApp.state.results.factorR.toFixed(2)}%</td>
                    </tr>
                    <tr class="separator">
                        <td colspan="2"></td>
                    </tr>
                    <tr>
                        <td>Enquadramento:</td>
                        <td><strong>${FatorRApp.state.results.classification}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function getStep5FooterHTML() {
    return `
        <button class="btn btn-secondary" onclick="startNewCalculation()">
            <i class="fas fa-redo"></i>
            Novo Cálculo
        </button>
        <button class="btn btn-primary" onclick="exportResults()">
            <i class="fas fa-download"></i>
            Exportar PDF
        </button>
        <button class="btn btn-accent" onclick="scrollToSection('comparative')">
            Ver Comparativo Detalhado
            <i class="fas fa-arrow-right"></i>
        </button>
    `;
}

// ==============================================
// CÁLCULO DO FATOR R
// ==============================================

function calculateFatorR() {
    const data = FatorRApp.state.calculatorData;
    
    // Calcula folha de pagamento total anual
    const totalPayroll = calculateTotalPayroll();
    
    // Calcula Fator R
    const factorR = (totalPayroll / data.annualRevenue) * 100;
    
    // Determina classificação
    const classification = factorR >= 28 ? 'Anexo III' : 'Anexo V';
    
    // Calcula impostos
    const anexoIIITax = calculateTax(data.annualRevenue, 'anexoIII');
    const anexoVTax = calculateTax(data.annualRevenue, 'anexoV');
    
    // Determina valores finais
    const monthlyTax = classification === 'Anexo III' ? anexoIIITax.monthly : anexoVTax.monthly;
    const annualTax = classification === 'Anexo III' ? anexoIIITax.annual : anexoVTax.annual;
    const savings = classification === 'Anexo III' ? (anexoVTax.annual - anexoIIITax.annual) : 0;
    
    // Armazena resultados
    FatorRApp.state.results = {
        factorR: factorR,
        classification: classification,
        monthlyTax: monthlyTax,
        annualTax: annualTax,
        savings: savings,
        anexoIIITax: anexoIIITax,
        anexoVTax: anexoVTax
    };
}

function calculateTotalPayroll() {
    const data = FatorRApp.state.calculatorData;
    
    let monthlyPayroll = data.proLabore + (data.employees * data.averageSalary);
    let annualPayroll = monthlyPayroll * 12;
    
    // Adiciona 13º salário
    if (data.includes13th) {
        annualPayroll += monthlyPayroll;
    }
    
    // Adiciona 1/3 de férias
    if (data.includesVacation) {
        annualPayroll += (monthlyPayroll * 4); // 1/3 de 12 meses = 4 meses
    }
    
    // Adiciona encargos sociais
    annualPayroll = annualPayroll * (1 + data.socialCharges);
    
    return annualPayroll;
}

function calculateTax(revenue, anexo) {
    const table = FatorRApp.tables[anexo];
    let tax = { monthly: 0, annual: 0, aliquot: 0, deduction: 0 };
    
    // Encontra a faixa correta
    for (let faixa of table) {
        if (revenue >= faixa.min && revenue <= faixa.max) {
            const aliquotEffective = ((revenue * faixa.aliquot) - faixa.deduction) / revenue;
            tax.annual = (revenue * faixa.aliquot) - faixa.deduction;
            tax.monthly = tax.annual / 12;
            tax.aliquot = aliquotEffective * 100;
            tax.deduction = faixa.deduction;
            break;
        }
    }
    
    return tax;
}

// ==============================================
// SIMULADOR
// ==============================================

function setupSimulator() {
    const simRevenue = document.getElementById('simRevenue');
    const simProlabore = document.getElementById('simProlabore');
    const simEmployees = document.getElementById('simEmployees');
    const simAvgSalary = document.getElementById('simAvgSalary');
    
    if (simRevenue) {
        simRevenue.addEventListener('input', updateSimulator);
        simProlabore.addEventListener('input', updateSimulator);
        simEmployees.addEventListener('input', updateSimulator);
        simAvgSalary.addEventListener('input', updateSimulator);
    }
    
    // Botões do simulador
    const simulateBtn = document.querySelector('.control-actions .btn-primary');
    const resetBtn = document.querySelector('.control-actions .btn-outline');
    
    if (simulateBtn) {
        simulateBtn.addEventListener('click', runSimulation);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulator);
    }
}

function updateSimulator(e) {
    const slider = e.target;
    const valueDisplay = slider.parentElement.querySelector('.slider-value');
    
    if (slider.id === 'simRevenue') {
        valueDisplay.textContent = `R$ ${formatCurrency(slider.value)}`;
        FatorRApp.state.simulatorData.revenue = parseFloat(slider.value);
    } else if (slider.id === 'simProlabore') {
        valueDisplay.textContent = `R$ ${formatCurrency(slider.value)}`;
        FatorRApp.state.simulatorData.prolabore = parseFloat(slider.value);
    } else if (slider.id === 'simEmployees') {
        valueDisplay.textContent = `${slider.value} funcionários`;
        FatorRApp.state.simulatorData.employees = parseInt(slider.value);
    } else if (slider.id === 'simAvgSalary') {
        valueDisplay.textContent = `R$ ${formatCurrency(slider.value)}`;
        FatorRApp.state.simulatorData.avgSalary = parseFloat(slider.value);
    }
}

function runSimulation() {
    const data = FatorRApp.state.simulatorData;
    
    // Calcula folha anual
    let monthlyPayroll = data.prolabore + (data.employees * data.avgSalary);
    let annualPayroll = monthlyPayroll * 12;
    
    // Adiciona 13º e férias (padrão)
    annualPayroll += monthlyPayroll; // 13º
    annualPayroll += (monthlyPayroll * 4); // 1/3 férias
    
    // Adiciona encargos (20% padrão)
    annualPayroll = annualPayroll * 1.2;
    
    // Calcula Fator R
    const factorR = (annualPayroll / data.revenue) * 100;
    const classification = factorR >= 28 ? 'Anexo III' : 'Anexo V';
    
    // Calcula impostos
    const anexoIIITax = calculateTax(data.revenue, 'anexoIII');
    const anexoVTax = calculateTax(data.revenue, 'anexoV');
    
    // Atualiza UI
    updateSimulationResults({
        factorR: factorR,
        classification: classification,
        anexoIIITax: anexoIIITax,
        anexoVTax: anexoVTax,
        savings: anexoVTax.annual - anexoIIITax.annual
    });
}

function updateSimulationResults(results) {
    // Atualiza badge de classificação
    const badge = document.querySelector('.result-badge');
    if (badge) {
        badge.className = `result-badge ${results.classification === 'Anexo III' ? 'success' : 'warning'}`;
        badge.innerHTML = `
            <i class="fas fa-${results.classification === 'Anexo III' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${results.classification}
        `;
    }
    
    // Atualiza Fator R
    const factorValue = document.querySelector('.result-metric .metric-value');
    if (factorValue) {
        factorValue.textContent = `${results.factorR.toFixed(1)}%`;
    }
    
    // Atualiza barra de progresso
    const progressFill = document.querySelector('.result-metric .progress-fill');
    if (progressFill) {
        progressFill.style.width = `${Math.min(results.factorR, 100)}%`;
    }
    
    // Atualiza comparação
    const comparisonItems = document.querySelectorAll('.comparison-item');
    if (comparisonItems[0]) {
        comparisonItems[0].querySelector('.comparison-value').textContent = 
            `R$ ${formatCurrency(results.anexoIIITax.monthly)}/mês`;
    }
    if (comparisonItems[1]) {
        comparisonItems[1].querySelector('.comparison-value').textContent = 
            `R$ ${formatCurrency(results.anexoVTax.monthly)}/mês`;
    }
    
    // Atualiza economia
    const savingsValue = document.querySelector('.savings-value');
    if (savingsValue && results.classification === 'Anexo III') {
        savingsValue.textContent = `R$ ${formatCurrency(results.savings)}/ano`;
    }
}

function resetSimulator() {
    // Reset valores padrão
    FatorRApp.state.simulatorData = {
        revenue: 1200000,
        prolabore: 15000,
        employees: 5,
        avgSalary: 3000
    };
    
    // Reset sliders
    document.getElementById('simRevenue').value = 1200000;
    document.getElementById('simProlabore').value = 15000;
    document.getElementById('simEmployees').value = 5;
    document.getElementById('simAvgSalary').value = 3000;
    
    // Atualiza displays
    document.querySelectorAll('.slider-value')[0].textContent = 'R$ 1.200.000,00';
    document.querySelectorAll('.slider-value')[1].textContent = 'R$ 15.000,00';
    document.querySelectorAll('.slider-value')[2].textContent = '5 funcionários';
    document.querySelectorAll('.slider-value')[3].textContent = 'R$ 3.000,00';
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function setupActivityCards() {
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            FatorRApp.state.calculatorData.activity = card.dataset.value;
        });
    });
}

function setupRevenueInput() {
    const input = document.getElementById('annualRevenue');
    if (input) {
        input.addEventListener('input', (e) => {
            e.target.value = formatCurrency(e.target.value.replace(/\D/g, ''));
            FatorRApp.state.calculatorData.annualRevenue = parseCurrency(e.target.value);
        });
    }
}

function setupPayrollInputs() {
    const proLabore = document.getElementById('proLabore');
    const employees = document.getElementById('employees');
    const avgSalary = document.getElementById('averageSalary');
    
    if (proLabore) {
        proLabore.addEventListener('input', (e) => {
            e.target.value = formatCurrency(e.target.value.replace(/\D/g, ''));
            FatorRApp.state.calculatorData.proLabore = parseCurrency(e.target.value);
            updatePayrollSummary();
        });
    }
    
    if (employees) {
        employees.addEventListener('input', (e) => {
            FatorRApp.state.calculatorData.employees = parseInt(e.target.value) || 0;
            updatePayrollSummary();
        });
    }
    
    if (avgSalary) {
        avgSalary.addEventListener('input', (e) => {
            e.target.value = formatCurrency(e.target.value.replace(/\D/g, ''));
            FatorRApp.state.calculatorData.averageSalary = parseCurrency(e.target.value);
            updatePayrollSummary();
        });
    }
}

function setupBenefitsInputs() {
    const includes13th = document.getElementById('includes13th');
    const includesVacation = document.getElementById('includesVacation');
    const socialCharges = document.getElementById('socialCharges');
    
    if (includes13th) {
        includes13th.addEventListener('change', (e) => {
            FatorRApp.state.calculatorData.includes13th = e.target.checked;
        });
    }
    
    if (includesVacation) {
        includesVacation.addEventListener('change', (e) => {
            FatorRApp.state.calculatorData.includesVacation = e.target.checked;
        });
    }
    
    if (socialCharges) {
        socialCharges.addEventListener('input', (e) => {
            FatorRApp.state.calculatorData.socialCharges = e.target.value / 100;
            document.querySelector('.percentage-value').textContent = `${e.target.value}%`;
        });
    }
}

function updatePayrollSummary() {
    const data = FatorRApp.state.calculatorData;
    const totalSalaries = data.employees * data.averageSalary;
    const total = data.proLabore + totalSalaries;
    
    const summaryProLabore = document.getElementById('summaryProLabore');
    const summarySalaries = document.getElementById('summarySalaries');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summaryProLabore) summaryProLabore.textContent = `R$ ${formatCurrency(data.proLabore)}`;
    if (summarySalaries) summarySalaries.textContent = `R$ ${formatCurrency(totalSalaries)}`;
    if (summaryTotal) summaryTotal.textContent = `R$ ${formatCurrency(total)}`;
}

function setRevenue(value) {
    const input = document.getElementById('annualRevenue');
    if (input) {
        input.value = formatCurrency(value);
        FatorRApp.state.calculatorData.annualRevenue = value;
    }
}

function validateCurrentStep() {
    const step = FatorRApp.state.currentStep;
    
    switch(step) {
        case 1:
            if (!FatorRApp.state.calculatorData.activity) {
                showNotification('Por favor, selecione a atividade principal da empresa', 'warning');
                return false;
            }
            break;
            
        case 2:
            if (!FatorRApp.state.calculatorData.annualRevenue || 
                FatorRApp.state.calculatorData.annualRevenue === 0) {
                showNotification('Por favor, informe o faturamento anual', 'warning');
                return false;
            }
            break;
            
        case 3:
            if (!FatorRApp.state.calculatorData.proLabore && 
                !FatorRApp.state.calculatorData.employees) {
                showNotification('Por favor, informe o pró-labore ou número de funcionários', 'warning');
                return false;
            }
            break;
    }
    
    return true;
}

function updateProgressBar() {
    const progress = (FatorRApp.state.currentStep / 5) * 100;
    const progressFill = document.querySelector('.calc-progress .progress-fill');
    const progressValue = document.querySelector('.calc-progress .progress-value');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    
    if (progressValue) {
        progressValue.textContent = `${Math.round(progress)}%`;
    }
}

function updateStepIndicators() {
    const stepItems = document.querySelectorAll('.step-item');
    
    stepItems.forEach((item, index) => {
        const stepNumber = index + 1;
        
        // Remove all classes
        item.classList.remove('active', 'completed');
        
        // Add appropriate class
        if (stepNumber === FatorRApp.state.currentStep) {
            item.classList.add('active');
        } else if (stepNumber < FatorRApp.state.currentStep) {
            item.classList.add('completed');
            item.querySelector('.step-status i').className = 'fas fa-check';
        } else {
            item.querySelector('.step-status i').className = 'fas fa-lock';
        }
    });
}

// ==============================================
// FORMATAÇÃO E UTILITÁRIOS
// ==============================================

function formatCurrency(value) {
    if (typeof value === 'string') {
        value = value.replace(/\D/g, '');
    }
    
    value = parseFloat(value) || 0;
    
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function parseCurrency(value) {
    if (typeof value === 'string') {
        value = value.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(value) || 0;
}

function showNotification(message, type = 'info') {
    // Cria elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'warning' ? 'exclamation-triangle' : 
                          type === 'error' ? 'times-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Adiciona ao body
    document.body.appendChild(notification);
    
    // Anima entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ==============================================
// EVENTOS GERAIS
// ==============================================

function setupEventListeners() {
    // Botão de início na hero
    window.startCalculator = function() {
        scrollToSection('calculator');
    };
    
    // Cancelar calculadora
    window.cancelCalculator = function() {
        if (confirm('Tem certeza que deseja cancelar o cálculo?')) {
            resetCalculator();
            scrollToSection('home');
        }
    };
    
    // Novo cálculo
    window.startNewCalculation = function() {
        resetCalculator();
        showStep(1);
    };
    
    // Exportar resultados
    window.exportResults = function() {
        generatePDF();
    };
}

function resetCalculator() {
    // Reset estado
    FatorRApp.state.currentStep = 1;
    FatorRApp.state.calculatorData = {
        companyName: '',
        cnpj: '',
        activity: '',
        annualRevenue: 0,
        proLabore: 0,
        employees: 0,
        averageSalary: 0,
        includes13th: true,
        includesVacation: true,
        socialCharges: 0.2
    };
    
    // Reset UI
    showStep(1);
    updateProgressBar();
    updateStepIndicators();
}

function displayResults() {
    // Anima entrada dos resultados
    const resultContainer = document.querySelector('.result-container');
    if (resultContainer) {
        resultContainer.style.opacity = '0';
        setTimeout(() => {
            resultContainer.style.opacity = '1';
        }, 100);
    }
}

// ==============================================
// ANIMAÇÕES
// ==============================================

function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observa elementos
    document.querySelectorAll('.feature-card, .stat-card, .result-card').forEach(el => {
        observer.observe(el);
    });
}

// ==============================================
// EXPORTAÇÃO PDF
// ==============================================

function generatePDF() {
    // Implementação básica de exportação
    // Em produção, usar biblioteca como jsPDF
    
    const results = FatorRApp.state.results;
    const data = FatorRApp.state.calculatorData;
    
    // Cria conteúdo para impressão
    const printContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>Relatório de Cálculo do Fator R</h1>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
            
            <h2>Dados da Empresa</h2>
            <p>Empresa: ${data.companyName || 'Não informado'}</p>
            <p>CNPJ: ${data.cnpj || 'Não informado'}</p>
            <p>Atividade: ${data.activity}</p>
            
            <h2>Resultado do Cálculo</h2>
            <p><strong>Fator R: ${results.factorR.toFixed(2)}%</strong></p>
            <p><strong>Classificação: ${results.classification}</strong></p>
            <p>Imposto Mensal: R$ ${formatCurrency(results.monthlyTax)}</p>
            <p>Imposto Anual: R$ ${formatCurrency(results.annualTax)}</p>
            <p>Economia Anual: R$ ${formatCurrency(results.savings)}</p>
            
            <h2>Dados Utilizados</h2>
            <p>Receita Bruta Anual: R$ ${formatCurrency(data.annualRevenue)}</p>
            <p>Folha de Pagamento Total: R$ ${formatCurrency(calculateTotalPayroll())}</p>
        </div>
    `;
    
    // Abre janela de impressão
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
    
    showNotification('Relatório gerado com sucesso!', 'success');
}

// ==============================================
// ESTILOS PARA NOTIFICAÇÕES (adicionar ao CSS)
// ==============================================

const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 9999;
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-left: 4px solid #10b981;
}

.notification.warning {
    border-left: 4px solid #f59e0b;
}

.notification.error {
    border-left: 4px solid #ef4444;
}

.notification.info {
    border-left: 4px solid #3b82f6;
}

.notification i {
    font-size: 20px;
}

.notification.success i { color: #10b981; }
.notification.warning i { color: #f59e0b; }
.notification.error i { color: #ef4444; }
.notification.info i { color: #3b82f6; }

/* Estilos adicionais para os novos elementos */
.revenue-input-wrapper,
.currency-input {
    position: relative;
    display: flex;
    align-items: center;
}

.currency-prefix {
    position: absolute;
    left: 16px;
    color: #64748b;
    font-weight: 500;
}

.revenue-input-wrapper input,
.currency-input input {
    padding-left: 48px;
}

.revenue-shortcuts {
    margin-top: 24px;
}

.shortcut-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 12px;
}

.shortcut-btn {
    padding: 8px 16px;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    color: #475569;
}

.shortcut-btn:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
}

.info-card {
    display: flex;
    gap: 16px;
    padding: 20px;
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    margin-top: 24px;
}

.info-card i {
    color: #0284c7;
    font-size: 20px;
}

.info-content h4 {
    margin-bottom: 12px;
    color: #0c4a6e;
}

.info-content ul {
    list-style: none;
    padding: 0;
}

.info-content li {
    padding: 4px 0;
    color: #475569;
}

.payroll-summary {
    margin-top: 32px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
}

.payroll-summary h4 {
    margin-bottom: 16px;
    color: #1e293b;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    color: #475569;
}

.summary-item.total {
    margin-top: 12px;
    padding-top: 16px;
    border-top: 2px solid #e2e8f0;
    font-weight: 600;
    color: #1e293b;
}

.benefits-options {
    display: grid;
    gap: 16px;
    margin-bottom: 32px;
}

.benefit-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
}

.benefit-header {
    display: flex;
    gap: 16px;
    align-items: center;
}

.benefit-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.benefit-info h4 {
    margin-bottom: 4px;
    color: #1e293b;
}

.benefit-info p {
    color: #64748b;
    font-size: 14px;
}

/* Switch Toggle */
.switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: .4s;
    border-radius: 30px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked + .slider {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

input:checked + .slider:before {
    transform: translateX(30px);
}

.percentage-input {
    display: flex;
    align-items: center;
    gap: 16px;
}

.percentage-input input[type="range"] {
    flex: 1;
}

.percentage-value {
    min-width: 50px;
    text-align: center;
    font-weight: 600;
    color: #2563eb;
}

.charges-breakdown {
    margin-top: 24px;
    padding: 20px;
    background: #fefce8;
    border: 1px solid #fef08a;
    border-radius: 8px;
}

.charges-breakdown h4 {
    margin-bottom: 16px;
    color: #713f12;
}

.charge-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    color: #854d0e;
}

/* Resultados */
.result-container {
    padding: 20px;
}

.main-result {
    display: flex;
    gap: 24px;
    padding: 32px;
    border-radius: 12px;
    margin-bottom: 32px;
    background: white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.main-result.success {
    border-left: 4px solid #10b981;
}

.main-result.warning {
    border-left: 4px solid #f59e0b;
}

.result-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
}

.factor-value {
    font-size: 48px;
    font-weight: 800;
    color: #2563eb;
    margin: 8px 0;
}

.classification {
    font-size: 18px;
    color: #475569;
}

.result-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.detail-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.detail-card.highlight {
    background: #f0fdf4;
    border-color: #86efac;
}

.detail-card i {
    font-size: 24px;
    color: #2563eb;
}

.detail-info {
    flex: 1;
}

.detail-label {
    display: block;
    font-size: 14px;
    color: #64748b;
    margin-bottom: 4px;
}

.detail-value {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
}

.calculation-breakdown {
    background: #f8fafc;
    border-radius: 8px;
    padding: 24px;
}

.calculation-breakdown h4 {
    margin-bottom: 16px;
    color: #1e293b;
}

.breakdown-table {
    width: 100%;
    border-collapse: collapse;
}

.breakdown-table td {
    padding: 12px 0;
    color: #475569;
}

.breakdown-table td:last-child {
    text-align: right;
    font-weight: 600;
    color: #1e293b;
}

.breakdown-table tr.separator td {
    padding: 8px 0;
    border-bottom: 2px solid #e2e8f0;
}
</style>`;

// Injeta estilos na página
if (!document.getElementById('fator-r-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'fator-r-styles';
    styleElement.innerHTML = notificationStyles;
    document.head.appendChild(styleElement);
}

// ==============================================
// GRÁFICOS E VISUALIZAÇÕES
// ==============================================

function createCharts() {
    // Verifica se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não encontrado. Gráficos não serão renderizados.');
        return;
    }
    
    createComparisonChart();
    createEvolutionChart();
    createDistributionChart();
}

function createComparisonChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;
    
    const data = FatorRApp.state.results;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Anexo III', 'Anexo V'],
            datasets: [{
                label: 'Imposto Anual',
                data: [data.anexoIIITax.annual, data.anexoVTax.annual],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(240, 147, 251, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(240, 147, 251, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'R$ ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function createEvolutionChart() {
    const ctx = document.getElementById('evolutionChart');
    if (!ctx) return;
    
    // Simula dados de evolução
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const factorRValues = [25.5, 26.2, 27.1, 28.3, 29.5, 31.5];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Fator R (%)',
                data: factorRValues,
                borderColor: 'rgba(102, 126, 234, 1)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Limite Anexo III',
                data: [28, 28, 28, 28, 28, 28],
                borderColor: 'rgba(16, 185, 129, 1)',
                borderDash: [5, 5],
                borderWidth: 2,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 40,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function createDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    
    const data = FatorRApp.state.calculatorData;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Folha de Pagamento', 'Outros Custos'],
            datasets: [{
                data: [
                    calculateTotalPayroll(),
                    data.annualRevenue - calculateTotalPayroll()
                ],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(229, 231, 235, 0.8)'
                ],
                borderColor: [
                    'rgba(102, 126, 234, 1)',
                    'rgba(229, 231, 235, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = ((value / data.annualRevenue) * 100).toFixed(1);
                            return label + ': ' + percentage + '%';
                        }
                    }
                }
            }
        }
    });
}

// ==============================================
// COMPARATIVO DETALHADO
// ==============================================

function setupComparativeSection() {
    const tabs = document.querySelectorAll('.comparative-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Aqui você pode adicionar lógica para mudar o conteúdo
            // baseado na aba selecionada
        });
    });
}

// ==============================================
// COMPARTILHAMENTO
// ==============================================

function shareResults() {
    const results = FatorRApp.state.results;
    const shareData = {
        title: 'Cálculo do Fator R',
        text: `Meu Fator R é ${results.factorR.toFixed(2)}% - Classificação: ${results.classification}`,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showNotification('Compartilhado com sucesso!', 'success'))
            .catch(err => console.log('Erro ao compartilhar:', err));
    } else {
        // Fallback - copiar para clipboard
        const text = `Fator R: ${results.factorR.toFixed(2)}%\nClassificação: ${results.classification}\nEconomia Anual: R$ ${formatCurrency(results.savings)}`;
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showNotification('Copiado para a área de transferência!', 'success');
}

// ==============================================
// SALVAMENTO LOCAL
// ==============================================

function saveToLocalStorage() {
    try {
        localStorage.setItem('fatorRData', JSON.stringify(FatorRApp.state));
        showNotification('Dados salvos localmente!', 'success');
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('fatorRData');
        if (savedData) {
            FatorRApp.state = JSON.parse(savedData);
            showNotification('Dados carregados com sucesso!', 'success');
            return true;
        }
    } catch (e) {
        console.error('Erro ao carregar:', e);
    }
    return false;
}

// ==============================================
// ATALHOS DE TECLADO
// ==============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S para salvar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveToLocalStorage();
        }
        
        // Ctrl/Cmd + P para imprimir/exportar
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            if (FatorRApp.state.currentStep === 5) {
                exportResults();
            }
        }
        
        // ESC para cancelar
        if (e.key === 'Escape') {
            const modal = document.querySelector('.modal.active');
            if (modal) {
                closeModal(modal);
            }
        }
    });
}

// ==============================================
// RESPONSIVIDADE
// ==============================================

function handleResponsive() {
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Ajusta elementos para mobile
        document.querySelectorAll('.option-cards').forEach(cards => {
            cards.style.gridTemplateColumns = '1fr';
        });
        
        // Ajusta navegação
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.add('mobile');
        }
    } else {
        // Restaura layout desktop
        document.querySelectorAll('.option-cards').forEach(cards => {
            cards.style.gridTemplateColumns = '';
        });
    }
}

// Event listener para mudanças de tamanho
window.addEventListener('resize', handleResponsive);

// ==============================================
// VALIDAÇÕES AVANÇADAS
// ==============================================

function validateCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    
    if (cnpj === '') return false;
    if (cnpj.length !== 14) return false;
    
    // Elimina CNPJs invalidos conhecidos
    if (cnpj === "00000000000000" || 
        cnpj === "11111111111111" || 
        cnpj === "22222222222222" || 
        cnpj === "33333333333333" || 
        cnpj === "44444444444444" || 
        cnpj === "55555555555555" || 
        cnpj === "66666666666666" || 
        cnpj === "77777777777777" || 
        cnpj === "88888888888888" || 
        cnpj === "99999999999999")
        return false;
    
    // Valida DVs
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) return false;
    
    return true;
}

// ==============================================
// INICIALIZAÇÃO COMPLETA
// ==============================================

// Adiciona todas as funções ao escopo global para uso inline no HTML
window.nextStep = nextStep;
window.previousStep = previousStep;
window.setRevenue = setRevenue;
window.cancelCalculator = cancelCalculator;
window.startNewCalculation = startNewCalculation;
window.exportResults = exportResults;
window.startCalculator = () => scrollToSection('calculator');

// Inicializa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('Fator R Pro - JavaScript carregado com sucesso!');