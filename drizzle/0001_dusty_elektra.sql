CREATE TABLE `cacambas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`identificacao` varchar(50) NOT NULL,
	`tamanho` varchar(50) NOT NULL,
	`capacidadeToneladas` decimal(10,2),
	`tipoMaterial` varchar(100),
	`localizacaoAtual` text,
	`statusDisponibilidade` enum('disponivel','alugada','manutencao','inativa') NOT NULL DEFAULT 'disponivel',
	`dataAquisicao` timestamp,
	`valorAquisicaoReais` decimal(12,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cacambas_id` PRIMARY KEY(`id`),
	CONSTRAINT `cacambas_identificacao_unique` UNIQUE(`identificacao`)
);
--> statement-breakpoint
CREATE TABLE `caminhoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`placa` varchar(10) NOT NULL,
	`marca` varchar(100) NOT NULL,
	`modelo` varchar(100) NOT NULL,
	`ano` int NOT NULL,
	`capacidadeToneladas` decimal(10,2),
	`crlv` varchar(50),
	`crlvValidade` timestamp,
	`seguroValidade` timestamp,
	`inspecaoTecnicaValidade` timestamp,
	`status` enum('operacional','manutencao','inativo') NOT NULL DEFAULT 'operacional',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caminhoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `caminhoes_placa_unique` UNIQUE(`placa`)
);
--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`razaoSocial` varchar(255) NOT NULL,
	`cnpjCpf` varchar(20) NOT NULL,
	`contato` varchar(255),
	`telefone` varchar(20),
	`email` varchar(320),
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`tipoCliente` enum('pf','pj') NOT NULL,
	`limiteCreditoReais` decimal(12,2) DEFAULT '0',
	`saldoDevedorReais` decimal(12,2) DEFAULT '0',
	`status` enum('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `clientes_cnpjCpf_unique` UNIQUE(`cnpjCpf`)
);
--> statement-breakpoint
CREATE TABLE `manutencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('caminhao','cacamba') NOT NULL,
	`tipoId` int NOT NULL,
	`descricao` text NOT NULL,
	`dataPrevista` timestamp,
	`dataRealizada` timestamp,
	`custoReais` decimal(12,2),
	`status` enum('agendada','realizada','cancelada') NOT NULL DEFAULT 'agendada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manutencoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `motoristas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cpf` varchar(14) NOT NULL,
	`telefone` varchar(20),
	`email` varchar(320),
	`cnh` varchar(20),
	`cnhValidade` timestamp,
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(2),
	`cep` varchar(10),
	`status` enum('ativo','inativo','afastado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `motoristas_id` PRIMARY KEY(`id`),
	CONSTRAINT `motoristas_cpf_unique` UNIQUE(`cpf`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroPedido` varchar(50) NOT NULL,
	`clienteId` int NOT NULL,
	`cacambaId` int NOT NULL,
	`motoristaId` int,
	`caminhaId` int,
	`localEntrega` text NOT NULL,
	`dataEntrega` timestamp NOT NULL,
	`dataRetirada` timestamp,
	`prazoVencimentoRetirada` timestamp NOT NULL,
	`valorLocacaoReais` decimal(12,2) NOT NULL,
	`observacoes` text,
	`status` enum('pendente','em_andamento','entregue','retirado','faturado','cancelado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`),
	CONSTRAINT `pedidos_numeroPedido_unique` UNIQUE(`numeroPedido`)
);
--> statement-breakpoint
CREATE TABLE `rotas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pedidoId` int NOT NULL,
	`motoristaId` int NOT NULL,
	`caminhaId` int NOT NULL,
	`dataRota` timestamp NOT NULL,
	`pontoPartida` text NOT NULL,
	`pontoDestino` text NOT NULL,
	`distanciaKm` decimal(10,2),
	`tempoEstimadoMinutos` int,
	`tempoRealMinutos` int,
	`rotaGeometria` text,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rotas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('receita','despesa') NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`descricao` text NOT NULL,
	`valorReais` decimal(12,2) NOT NULL,
	`pedidoId` int,
	`dataTransacao` timestamp NOT NULL,
	`dataRecebimentoPagamento` timestamp,
	`formaPagamento` varchar(50),
	`comprovante` text,
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transacoes_id` PRIMARY KEY(`id`)
);
