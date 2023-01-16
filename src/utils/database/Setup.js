import MdbRuntimeVariable from '../../models/MdbRuntimeVariable.js'
import MigrationBase from './MigrationBase.js';
export default class Setup {
    /**
     * command list of migrations
     */
    static commands = [
        // runtime variables
        `CREATE TABLE "app_runtime_variables" (
            "id" INTEGER NOT NULL,
            "project_id" INTEGER,
            "key" TEXT,
            "value" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 运行时变量表
        `INSERT INTO "app_runtime_variables" VALUES (null, 0, 'project_actived_id', 1)`,

        // 创建字典表
        `CREATE TABLE "app_dictionary" (
            "id" INTEGER NOT NULL,
            "group" TEXT,
            "group_name" TEXT,
            "key" TEXT,
            "name" TEXT,
            "value" TEXT,
            "options" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 插入字典值
        `INSERT INTO "app_dictionary" VALUES (1, 'ENDIANNESS', '字节序', 'BIG_ENDIAN', '大端模式', 'big-endian', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (2, 'ENDIANNESS', '字节序', 'LITTLE_ENDIAN', '小端模式', 'little-endian', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (3, 'CHARSET', '字符集', 'UTF8', 'UTF8', 'utf8', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (4, 'CHARSET', '字符集', 'GBK', 'GBK', 'gbk', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (5, 'CHARSET', '字符集', 'GB2313', 'GB2313', 'gb2313', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (6, 'CHARSET', '字符集', 'Big5', 'Big5', 'Big5', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (7, 'DIRECTIVE_PARAM_FORMAT', '指令请求参数格式', 'HEX', 'HEX', 'hex', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (8, 'DIRECTIVE_PARAM_FORMAT', '指令请求参数格式', 'STRING', '字符串', 'string', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (9, 'DIRECTIVE_PARAM_FORMAT', '指令请求参数格式', 'FORM', '表单', 'form', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (10, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'BYTE', '字节 (uint8)', 'byte', '{"unsigned":true,"length":1,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (11, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'BYTE_SIGNED', '单字节整型 (int8)', 'char_int', '{"unsigned":false,"length":1}')`,
        `INSERT INTO "app_dictionary" VALUES (12, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'CHAR', '字符 (int8)', 'char', '{"unsigned":false,"length":1}')`,
        `INSERT INTO "app_dictionary" VALUES (13, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'UNSIGNED_CHAR', '无符号字符 (uint8)', 'unsigned_char', '{"unsigned":true,"length":1,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (14, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'SHORT', '短整型 (int16)', 'short', '{"unsigned":false,"length":2}')`,
        `INSERT INTO "app_dictionary" VALUES (15, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'UNSIGNED_SHORT', '无符号短整型 (uint16)', 'unsigned_short', '{"unsigned":true,"length":2,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (16, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'INT', '整型 (int32)', 'int', '{"unsigned":false,"length":4}')`,
        `INSERT INTO "app_dictionary" VALUES (17, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'UNSIGNED_INT', '无符号整型 (uint32)', 'unsigned_int', '{"unsigned":true,"length":4,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (18, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'LONG', '长整型 (int32)', 'long', '{"unsigned":false,"length":4}')`,
        `INSERT INTO "app_dictionary" VALUES (19, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'UNSIGNED_LONG', '无符号长整型 (uint32)', 'unsigned_long', '{"unsigned":true,"length":4,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (20, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'LONG_LONG', '长长整型 (int64)', 'long_long', '{"unsigned":false,"length":8}')`,
        `INSERT INTO "app_dictionary" VALUES (21, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'UNISNGED_LONG_LONG', '无符号长长整型 (uint64)', 'unsigned_long_long', '{"unsigned":true,"length":8,"formatable":true}')`,
        `INSERT INTO "app_dictionary" VALUES (22, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'FLOAT', '单精度浮点数 (float)', 'float', '{"length":4}')`,
        `INSERT INTO "app_dictionary" VALUES (23, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'DOUBLE', '双精度浮点数 (double)', 'double', '{"length":8}')`,
        `INSERT INTO "app_dictionary" VALUES (24, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'STRING', '字符串', 'string', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (25, 'DIRECTIVE_PARAM_DATATYPE', '指令请求参数类型', 'BYTES', '字节组', 'bytes', '{}')`,
        `INSERT INTO "app_dictionary" VALUES (26, 'DIRECTIVE_PARAM_BYTE_FORMATTER', '指令字节数据格式', 'BIN', '二进制', 'bin', '{"prefix":"0b"}')`,
        `INSERT INTO "app_dictionary" VALUES (27, 'DIRECTIVE_PARAM_BYTE_FORMATTER', '指令字节数据格式', 'OCT', '八进制', 'oct', '{"prefix":"0"}')`,
        `INSERT INTO "app_dictionary" VALUES (28, 'DIRECTIVE_PARAM_BYTE_FORMATTER', '指令字节数据格式', 'DEC', '十进制', 'dec', '{"prefix":""}')`,
        `INSERT INTO "app_dictionary" VALUES (29, 'DIRECTIVE_PARAM_BYTE_FORMATTER', '指令字节数据格式', 'HEX', '十六进制', 'hex', '{"prefix":"0x"}')`,
        `INSERT INTO "app_dictionary" VALUES (30, 'DIRECTIVE_COMMUNICATION_TYPE', '指令通讯类型', 'SERIALPORT', '串口', 'SerialPort', '{"disabled":false}')`,
        `INSERT INTO "app_dictionary" VALUES (31, 'DIRECTIVE_COMMUNICATION_TYPE', '指令通讯类型', 'NETWORK', '网络', 'Network', '{"disabled":false}')`,
        `INSERT INTO "app_dictionary" VALUES (32, 'DIRECTIVE_COMMUNICATION_TYPE', '指令通讯类型', 'BLUETOOTH', '蓝牙', 'Bluetooth', '{"disabled":true}')`,

        // 指令条目表
        `CREATE TABLE "app_directive_entries" (
            "id" INTEGER NOT NULL,
            "project_id" INTEGER,
            "type" TEXT,
            "target" INTEGER,
            "parent_id" INTEGER,
            PRIMARY KEY ("id")
        )`,
        
        // 指令文件夹
        `CREATE TABLE "app_directive_folders" (
            "id" INTEGER NOT NULL,
            "name" TEXT,
            PRIMARY KEY ("id")
        )`,
        
        // 指令表
        `CREATE TABLE "app_directives" (
            "id" INTEGER NOT NULL,
            "name" TEXT,
            "description" TEXT,
            "attributes" TEXT,
            "endianness" TEXT,
            "target" TEXT,
            "request_format" TEXT,
            "request_content" TEXT,
            "request_charset" TEXT,
            "request_script_lang" TEXT,
            "request_script" TEXT,
            "response_charset" TEXT,
            "response_script_lang" TEXT,
            "response_script" TEXT,
            "response_formatter" TEXT,
            "nlstyle" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 环境变量表
        `CREATE TABLE "app_environments" (
            "id" INTEGER NOT NULL,
            "project_id" INTEGER,
            "name" TEXT,
            "content" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 面板表
        `CREATE TABLE "app_panels" (
            "id" INTEGER NOT NULL,
            "project_id" INTEGER,
            "name" TEXT,
            "widgets" TEXT,
            "variables" TEXT,
            PRIMARY KEY ("id")
        )`,
        
        // 项目表
        `CREATE TABLE "app_projects" (
            "id" INTEGER NOT NULL,
            "name" TEXT,
            "description" TEXT,
            "charset" TEXT,
            "endianness" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 创建默认项目
        `INSERT INTO "app_projects" VALUES (1, '默认项目', '', 'utf8', 'big-endian')`,
        
        // 测试用例表
        `CREATE TABLE "app_testcases" (
            "id" INTEGER NOT NULL,
            "directive_id" INTEGER,
            "title" TEXT,
            "param_format" TEXT,
            "params" TEXT,
            "expect_format" TEXT,
            "expect" TEXT,
            PRIMARY KEY ("id")
        )`,

        // 测试用例增加超时属性
        'ALTER TABLE app_testcases ADD COLUMN "timeout" INTEGER DEFAULT 2000',
        
        // 测试用例增加执行前脚本属性
        'ALTER TABLE app_testcases ADD COLUMN "before_script" TEXT DEFAULT \'\'',

        // 测试用例增加执行后脚本属性
        'ALTER TABLE app_testcases ADD COLUMN "after_script" TEXT DEFAULT \'\'',

        // 项目表增加自增属性
        'ALTER TABLE "main"."app_projects" RENAME TO "_app_projects_old_20220513_2"',
        `CREATE TABLE "main"."app_projects" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "name" TEXT,
            "description" TEXT,
            "charset" TEXT,
            "endianness" TEXT
        )`,
        `INSERT INTO "main"."app_projects" ("id", "name", "description", "charset", "endianness") 
         SELECT "id", "name", "description", "charset", "endianness" FROM "main"."_app_projects_old_20220513_2"`,
        `DROP TABLE _app_projects_old_20220513_2`,

        // 测试用例表增加自增属性
        'ALTER TABLE "main"."app_testcases" RENAME TO "_app_testcases_old_20220513"',
        `CREATE TABLE "main"."app_testcases" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "directive_id" INTEGER,
            "title" TEXT,
            "param_format" TEXT,
            "params" TEXT,
            "expect_format" TEXT,
            "expect" TEXT,
            "timeout" INTEGER DEFAULT 2000,
            "before_script" TEXT DEFAULT '',
            "after_script" TEXT DEFAULT ''
        )`,
        `INSERT INTO "main"."app_testcases" ("id", "directive_id", "title", "param_format", "params", "expect_format", "expect", "timeout", "before_script", "after_script") 
         SELECT "id", "directive_id", "title", "param_format", "params", "expect_format", "expect", "timeout", "before_script", "after_script" FROM "main"."_app_testcases_old_20220513"`,
        `DROP TABLE _app_testcases_old_20220513`,
        
        // 应用运行时配置表
        `ALTER TABLE "main"."app_runtime_variables" RENAME TO "_app_runtime_variables_old_20220513"`,
        `CREATE TABLE "main"."app_runtime_variables" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "project_id" INTEGER,
            "key" TEXT,
            "value" TEXT
         )`,
        `INSERT INTO "main"."app_runtime_variables" ("id", "project_id", "key", "value") 
            SELECT "id", "project_id", "key", "value" FROM "main"."_app_runtime_variables_old_20220513"`,
        `DROP TABLE _app_runtime_variables_old_20220513`,
        
        // 面板表增加自增属性
        `ALTER TABLE "main"."app_panels" RENAME TO "_app_panels_old_20220513"`,
        `CREATE TABLE "main"."app_panels" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "project_id" INTEGER,
            "name" TEXT,
            "widgets" TEXT,
            "variables" TEXT
        )`,
        `INSERT INTO "main"."app_panels" ("id", "project_id", "name", "widgets", "variables") 
         SELECT "id", "project_id", "name", "widgets", "variables" FROM "main"."_app_panels_old_20220513"`,
        'DROP TABLE _app_panels_old_20220513',

        // 环境变量增加自增属性
        `ALTER TABLE "main"."app_environments" RENAME TO "_app_environments_old_20220513"`,
        `CREATE TABLE "main"."app_environments" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "project_id" INTEGER,
            "name" TEXT,
            "content" TEXT
        )`,
        `INSERT INTO "main"."app_environments" ("id", "project_id", "name", "content") 
         SELECT "id", "project_id", "name", "content" FROM "main"."_app_environments_old_20220513"`,
        `DROP TABLE _app_environments_old_20220513`,

        // 指令表增加环境变量
        `ALTER TABLE "main"."app_directives" RENAME TO "_app_directives_old_20220513"`,
        `CREATE TABLE "main"."app_directives" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "name" TEXT,
            "description" TEXT,
            "attributes" TEXT,
            "endianness" TEXT,
            "target" TEXT,
            "request_format" TEXT,
            "request_content" TEXT,
            "request_charset" TEXT,
            "request_script_lang" TEXT,
            "request_script" TEXT,
            "response_charset" TEXT,
            "response_script_lang" TEXT,
            "response_script" TEXT,
            "response_formatter" TEXT,
            "nlstyle" TEXT
        )`,
        `INSERT INTO "main"."app_directives" (
            "id", "name", "description", "attributes", "endianness", "target", "request_format", "request_content", 
            "request_charset", "request_script_lang", "request_script", "response_charset", "response_script_lang", 
            "response_script", "response_formatter", "nlstyle"
        ) SELECT 
            "id", "name", "description", "attributes", "endianness", "target", "request_format", "request_content", 
            "request_charset", "request_script_lang", "request_script", "response_charset", "response_script_lang", 
            "response_script", "response_formatter", "nlstyle" 
        FROM "main"."_app_directives_old_20220513"`,
        `DROP TABLE _app_directives_old_20220513`,

        // 指令文件夹表增加自增属性
        `ALTER TABLE "main"."app_directive_folders" RENAME TO "_app_directive_folders_old_20220513"`,
        `CREATE TABLE "main"."app_directive_folders" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "name" TEXT
        )`,
        `INSERT INTO "main"."app_directive_folders" ("id", "name") 
         SELECT "id", "name" FROM "main"."_app_directive_folders_old_20220513"`,
        `DROP TABLE _app_directive_folders_old_20220513`,
        
        // 指令条目表增加自增属性
        `ALTER TABLE "main"."app_directive_entries" RENAME TO "_app_directive_entries_old_20220513"`,
        `CREATE TABLE "main"."app_directive_entries" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "project_id" INTEGER,
            "type" TEXT,
            "target" INTEGER,
            "parent_id" INTEGER
        )`,
        `INSERT INTO "main"."app_directive_entries" ("id", "project_id", "type", "target", "parent_id") 
         SELECT "id", "project_id", "type", "target", "parent_id" FROM "main"."_app_directive_entries_old_20220513"`,
        `DROP TABLE _app_directive_entries_old_20220513`,

        // 字典表增加自增属性
        `ALTER TABLE "main"."app_dictionary" RENAME TO "_app_dictionary_old_20220513"`,
        `CREATE TABLE "main"."app_dictionary" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "group" TEXT,
            "group_name" TEXT,
            "key" TEXT,
            "name" TEXT,
            "value" TEXT,
            "options" TEXT
        )`,
        `INSERT INTO "main"."app_dictionary" ("id", "group", "group_name", "key", "name", "value", "options") 
         SELECT "id", "group", "group_name", "key", "name", "value", "options" FROM "main"."_app_dictionary_old_20220513"`,
        `DROP TABLE _app_dictionary_old_20220513`,

        // 项目表增加 远程项目UUID
        'ALTER TABLE app_projects ADD COLUMN "remote_uuid" TEXT DEFAULT \'\'',
        // 项目表增加 版本号字段
        'ALTER TABLE app_projects ADD COLUMN "version" INTEGER DEFAULT 0',
        
        require('../../migrations/m202205180904_alter_table_project_add_column_uuid.js'),
        require('../../migrations/m202205181025_alter_table_directives_add_column_project_uuid.js'),
        require('../../migrations/m202205181052_alter_table_directive_entries_add_column_project_uuid.js'),
        require('../../migrations/m202205181140_alter_table_directive_folders_add_column_project_uuid.js'),
        require('../../migrations/m202205181210_alter_table_panels_add_column_project_uuid.js'),
        require('../../migrations/m202205181257_alter_table_testcases_add_ccolumn_project_uuid.js'),
        require('../../migrations/m202205181334_alter_table_environments_add_column_project_uuid.js'),
        require('../../migrations/m202205181858_alter_table_directive_folders_change_id_to_uuid.js'),
        require('../../migrations/m202205182214_alter_table_directive_folder_rename_column_project_uuid_to_project_id.js'),
        require('../../migrations/m202205190937_alter_table_directives_change_id_to_uuid.js'),
        require('../../migrations/m202205191007_alter_table_directives_rename_column_project_uuid_to_project_id.js'),
        require('../../migrations/m202205191047_alter_table_directive_entries_change_id_to_uuid.js'),
        require('../../migrations/m202205191115_alter_table_directive_entries_change_parent_id_target_to_text.js'),
        require('../../migrations/m202205191141_alter_table_directive_entries_change_column_project_uuid_to_project_id.js'),
        require('../../migrations/m202205191207_alter_table_project_change_uuid_to_id.js'),
        require('../../migrations/m202205191307_alter_tables_change_project_uuid_to_project_id.js'),
        require('../../migrations/m202205191248_alter_table_testcases_change_id_to_uuid.js'),
        require('../../migrations/m202205191309_alter_table_runtime_variables_change_id_to_uuid'),
        require('../../migrations/m202205191311_alter_table_panels_change_id_to_uuid'),
        require('../../migrations/m202205191315_alter_table_environments_change_id_to_uuid'),
        require('../../migrations/m202205192118_alter_table_project_add_column_source_uuid.js'),
        require('../../migrations/m202206161012_alter_table_project_add_column_script.js'),
        require('../../migrations/m202206261026_alter_table_project_add_column_default_target_type.js'),
        require('../../migrations/m202207100658_update_table_directionary_update_param_format.js'),
        require('../../migrations/m202207181036_update_table_directive_change_parameter_format_from_string_to_text.js'),
        require('../../migrations/m202208061051_update_table_panel_set_widget_position_to_integer.js'),
        require('../../migrations/m202208082222_insert_table_dict_add_param_format_file.js'),
        require('../../migrations/m202208091013_insert_table_dict_add_param_datatype_file.js'),
        require('../../migrations/m202208111735_update_table_directive_set_target_modbus_with_ext_params.js'),
        require('../../migrations/m202208271017_insert_table_dict_add_param_format_none.js'),
        require('../../migrations/m202209221423_insert_table_app_runtime_variables_set_project_actived_id.js'),
        require('../../migrations/m202209231534_insert_demo_data.js'),
        require('../../migrations/m202211212100_create_table_app_functional_testcases.js'),
        require('../../migrations/m202211290850_alter_table_app_functional_testcases_add_timeout.js'),
        require('../../migrations/m202212051012_update_table_app_dictionary_update_charset_values.js'),
        require('../../migrations/m202212081217_insert_table_dict_add_param_datatype_bits.js'),
        require('../../migrations/m202212261035_update_table_directive_update_reqest_content_file.js'),
        require('../../migrations/m202301061145_create_table_app_mocks.js'),
        require('../../migrations/m202301161807_update_table_app_mocks_add_column_summary.js'),
    ];

    /**
     * start database setup
     * @returns {Promise}
     */
    static async start() {
        let setup = new Setup();
        let step = 0;
        try {
            step = await MdbRuntimeVariable.getVarValue('database_migrate_step', 0) * 1;
        } catch {
            step = 0;
        }

        if ( 'test' !== window.envName ) {
            console.log("Database setup start : ");
            console.log(`> command length = ${Setup.commands.length}`);
            console.log(`> step = ${step}`);
        }
        
        if ( step < Setup.commands.length ) {
            await setup.backupDatabase();
        }
        
        try {
            for ( ; step < Setup.commands.length; step++ ) {
                let migration = Setup.commands[step];
                await setup.exec(migration);
            }
            await MdbRuntimeVariable.setVarValue('database_migrate_step', step);
        } catch ( e ) {
            await setup.rollbackDatabase();
            console.log(e);
        }
    }

    /**
     * backup database
     * @returns {Promise}
     */
    backupDatabase() {
        return new Promise(function( resolve, reject ) {
            if ( 'test' === window.envName ) {
                resolve();
                return;
            }

            let dbPath = window.remote.app.getPath('userData') + '/bittly.db';
            let backupPath = window.remote.app.getPath('userData') + '/bittly.db.backup';
            window.fs.readFile(dbPath, function( err, data ) {
                if (err) {
                    reject(err);
                    return;
                }
                window.fs.writeFile(backupPath, data, function(writeErr) {
                    if (writeErr) {
                        reject(writeErr);
                        return;
                    }
                    console.log("< database backuped");
                    resolve();
                });
            });
        });
    }

    /**
     * rollback database
     * @returns {Promise}
     */
    rollbackDatabase() {
        return new Promise(function( resolve, reject ) {
            if ( 'test' === window.envName ) {
                resolve();
                return;
            }

            let dbPath = window.remote.app.getPath('userData') + '/bittly.db';
            let backupPath = window.remote.app.getPath('userData') + '/bittly.db.backup';
            window.fs.readFile(backupPath, function( err, data ) {
                if (err) {
                    reject(err);
                    return;
                }
                window.fs.writeFile(dbPath, data, function(writeErr) {
                    if (writeErr) {
                        reject(writeErr);
                        return;
                    }
                    console.log("< database rollbacked");
                    resolve();
                });
            });
        });
    }

    /**
     * execute migration
     * @async
     * @param {MigrationBase|String} migration 
     */
    async exec(migration) {
        if ( 'object' == typeof(migration) ) {
            await this.execMigrationClass(migration);
        } else {
            await this.execMigrationString(migration);
        }
    }

    /**
     * execute database migration class
     * @param {MigrationBase} migration 
     */
    async execMigrationClass( migration ) {
        let handler = new migration.default();
        await handler.executeUp();
    }

    /**
     * execute migration string
     * @returns {Promise}
     */
    execMigrationString(sql) {
        return new Promise(function( resolve, reject ) {
            window.database.run(sql, [], function( err ) {
                if ( null != err ) {
                    reject(err);
                    return;
                }
                resolve(true);
            });
        });
    }
}