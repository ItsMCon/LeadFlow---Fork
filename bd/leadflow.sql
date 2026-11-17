CREATE DATABASE IF NOT EXISTS leadflow;
USE leadflow;

DROP TABLE IF EXISTS operacao;
DROP TABLE IF EXISTS ia;
DROP TABLE IF EXISTS leads;
DROP TABLE IF EXISTS sdr;

CREATE TABLE sdr (
  email       VARCHAR(255) PRIMARY KEY,
  nome        VARCHAR(150) NOT NULL,
  senha_hash  VARCHAR(255),
  cargo       VARCHAR(100)
);

CREATE TABLE leads (
  id                 CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  criado_em          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- pra mostrar a data atual que foi criado
  atualizado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  nome_pessoa        VARCHAR(150) NOT NULL,
  nome_empresa       VARCHAR(150) NOT NULL,
  email              VARCHAR(255),
  whatsapp           VARCHAR(20),
  descricao          TEXT,
  solucao_interesse  VARCHAR(100),
  nicho              VARCHAR(100),
  origem             ENUM('SITE','SDR') NOT NULL,
  situacao           VARCHAR(50) NOT NULL DEFAULT 'Novo',
  responsavel_sdr    VARCHAR(255),
  cadastrado_por     VARCHAR(255),
  FOREIGN KEY (responsavel_sdr) REFERENCES sdr (email) ON DELETE SET NULL,
  FOREIGN KEY (cadastrado_por)  REFERENCES sdr (email)
);

CREATE TABLE ia (
  id                  CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  lead_id             CHAR(36) NOT NULL,
  prioridade          ENUM('Alta','Média','Baixa'),
  justificativa       TEXT,
  abordagem           TEXT,
  status_ia           ENUM('Pendente','Processado','Erro') NOT NULL DEFAULT 'Pendente',
  data_processamento  DATETIME,
  FOREIGN KEY (lead_id) REFERENCES leads (id) ON DELETE CASCADE
);

CREATE TABLE operacao (
  sdr_email           VARCHAR(255) NOT NULL,
  lead_id             CHAR(36) NOT NULL,
  tentativas_contato  INT NOT NULL DEFAULT 0,
  ultimo_contato      DATETIME,
  proximo_contato     DATETIME,
  PRIMARY KEY (sdr_email, lead_id),
  FOREIGN KEY (sdr_email) REFERENCES sdr (email) ON DELETE CASCADE,
  FOREIGN KEY (lead_id)   REFERENCES leads (id)  ON DELETE CASCADE
);

-- colocando valores hipotéticos
INSERT INTO sdr (email, nome, cargo) VALUES
  ('eduardo.barros@consultoriafocus.com',    'Eduardo Barros',    'SDR'),

  ('mariafernanda.fernandes@consultoriafocus.com',  'Maria Fernanda Fernandes',  'SDR Sênior'),

  ('gabriel.valim@consultoriafocus.com','Gabriel Valim','SDR');

INSERT INTO leads (nome_pessoa, nome_empresa, email, whatsapp, descricao, solucao_interesse, nicho, origem, situacao, responsavel_sdr, cadastrado_por) VALUES
  ('Luma Campos', 'Empresa Exemplo', 'luma@exemplo.com', '21999990001',
   'Queremos automatizar o atendimento comercial.', 'Automação de Processos', 'Serviços',
   'SITE', 'Novo', NULL, NULL),

  ('Luis Felipe', 'Padaria Modelo', 'luis@padariamodelo.com', NULL,
   'Precisa organizar pedidos e entregas.', 'Automação de Processos', 'Alimentício',
   'SDR', 'Em contato', 'eduardo.barros@consultoriafocus.com', 'eduardo.barros@consultoriafocus.com'),

  ('Vitto Baroni', 'Clínica Vida', 'vitto@clinicavida.com', '21999990003',
   'Agendamentos manuais geram muitos erros.', 'Gestão de Atendimento', 'Saúde',
   'SITE', 'Qualificado', 'gabriel.valim@consultoriafocus.com', NULL);


INSERT INTO ia (lead_id, prioridade, justificativa, abordagem, status_ia, data_processamento) VALUES
  ((SELECT id FROM leads WHERE email = 'luma@exemplo.com'),
   'Alta', 'Dor operacional clara e prazo mencionado.',
   'Investigar o fluxo atual e o impacto no tempo da equipe.', 'Processado', '2026-11-14 10:30:00'),
  ((SELECT id FROM leads WHERE email = 'luis@padariamodelo.com'),
   'Baixa', 'Necessidade genérica, sem prazo definido.',
   'Enviar material introdutório e acompanhar.', 'Processado', '2026-11-14 11:00:00'),
  ((SELECT id FROM leads WHERE email = 'vitto@clinicavida.com'),
   NULL, NULL, NULL, 'Erro', NULL);


INSERT INTO operacao (sdr_email, lead_id, tentativas_contato, ultimo_contato, proximo_contato) VALUES
  ('eduardo.barros@consultoriafocus.com',
   (SELECT id FROM leads WHERE email = 'luis@padariamodelo.com'),
   2, '2026-11-13 15:00:00', '2026-11-17 09:30:00'),
  ('mariafernanda.fernandes@consultoriafocus.com',
   (SELECT id FROM leads WHERE email = 'vitto@clinicavida.com'),
   1, '2026-11-14 16:20:00', '2026-11-18 14:00:00'),
  ('gabriel.valim@consultoriafocus.com',
   (SELECT id FROM leads WHERE email = 'luma@exemplo.com'),
   0, NULL, '2026-11-16 10:00:00');


-- pra encontrar operações específicas, basta adicionar as condições que queira
-- para fins de visualização, deixaremos apenas os comandos normais para ver todas as tabelas

SELECT * FROM ia;
SELECT * FROM leads;
SELECT * FROM operacao;
SELECT * FROM sdr;