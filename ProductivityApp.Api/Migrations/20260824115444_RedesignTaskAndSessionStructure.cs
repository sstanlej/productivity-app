using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProductivityApp.Api.Migrations
{
    /// <inheritdoc />
    public partial class RedesignTaskAndSessionStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentDueDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "OriginalDueDate",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "PointsValue",
                table: "Tasks");

            migrationBuilder.RenameColumn(
                name: "RescheduleCount",
                table: "Tasks",
                newName: "DeadlineShiftCount");

            migrationBuilder.AddColumn<bool>(
                name: "CanExtendDeadline",
                table: "Tasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "Deadline",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalDeadline",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaskSessions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TaskItemId = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    StartTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RescheduleCount = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskSessions_Tasks_TaskItemId",
                        column: x => x.TaskItemId,
                        principalTable: "Tasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskSessions_TaskItemId",
                table: "TaskSessions",
                column: "TaskItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskSessions");

            migrationBuilder.DropColumn(
                name: "CanExtendDeadline",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "Deadline",
                table: "Tasks");

            migrationBuilder.DropColumn(
                name: "OriginalDeadline",
                table: "Tasks");

            migrationBuilder.RenameColumn(
                name: "DeadlineShiftCount",
                table: "Tasks",
                newName: "RescheduleCount");

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentDueDate",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "OriginalDueDate",
                table: "Tasks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "PointsValue",
                table: "Tasks",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
